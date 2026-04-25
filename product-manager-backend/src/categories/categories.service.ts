import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryTreeNode } from './types';

const LOOP_ERROR_MESSAGE = 'Category hierarchy cannot contain loops';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const normalizedName = this.normalizeCategoryName(createCategoryDto.name);

    await this.ensureNoDuplicateCategoryName(normalizedName);

    if (createCategoryDto.parentId !== undefined) {
      await this.ensureCategoryExists(createCategoryDto.parentId);
    }

    return this.prisma.category.create({
      data: {
        name: normalizedName,
        parentId: createCategoryDto.parentId,
      },
    });
  }

  async getAll() {
    return this.prisma.category.findMany();
  }
  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    const nodeById = new Map<number, CategoryTreeNode>();

    for (const category of categories) {
      nodeById.set(category.id, {
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        fullPath: category.name,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];

    for (const category of categories) {
      const currentNode = nodeById.get(category.id);

      if (!currentNode) {
        continue;
      }

      if (category.parentId === null) {
        roots.push(currentNode);
        continue;
      }

      const parentNode = nodeById.get(category.parentId);

      if (!parentNode) {
        roots.push(currentNode);
        continue;
      }

      parentNode.children.push(currentNode);
    }

    const assignPaths = (node: CategoryTreeNode, parentPath: string | null) => {
      node.fullPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

      for (const child of node.children) {
        assignPaths(child, node.fullPath);
      }
    };

    for (const rootNode of roots) {
      assignPaths(rootNode, null);
    }

    return roots;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const hasNameToUpdate = updateCategoryDto.name !== undefined;
    const hasParentIdToUpdate = updateCategoryDto.parentId !== undefined;

    if (hasParentIdToUpdate) {
      await this.ensureNoHierarchyLoop(id, updateCategoryDto.parentId);
    }

    if (!hasNameToUpdate && !hasParentIdToUpdate) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const normalizedName = hasNameToUpdate
      ? this.normalizeCategoryName(updateCategoryDto.name)
      : existingCategory.name;
    const nextName = normalizedName;
    await this.ensureNoDuplicateCategoryName(nextName, id);

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(hasNameToUpdate && {
          name: normalizedName,
        }),
        ...(hasParentIdToUpdate && {
          parentId: updateCategoryDto.parentId,
        }),
      },
    });
  }

  async remove(id: number) {
    await this.ensureCategoryExists(id);

    const [childrenCount, productsCount] = await Promise.all([
      this.prisma.category.count({
        where: { parentId: id },
      }),
      this.prisma.product.count({
        where: { categoryId: id },
      }),
    ]);

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Category cannot be deleted while it has child categories',
      );
    }

    if (productsCount > 0) {
      throw new BadRequestException(
        'Category cannot be deleted while it has linked products',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: `Category with id ${id} deleted successfully` };
  }

  private async ensureCategoryExists(id: number) {
    const exists = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }

  private async ensureNoHierarchyLoop(
    categoryId: number,
    parentId?: number | null,
  ) {
    if (parentId === null || parentId === undefined) {
      return;
    }

    if (parentId === categoryId) {
      throw new BadRequestException(LOOP_ERROR_MESSAGE);
    }

    await this.ensureCategoryExists(parentId);

    let currentParentId: number | null = parentId;

    const visited = new Set<number>();

    while (currentParentId !== null) {
      if (currentParentId === categoryId) {
        throw new BadRequestException(LOOP_ERROR_MESSAGE);
      }

      if (visited.has(currentParentId)) {
        throw new BadRequestException(LOOP_ERROR_MESSAGE);
      }

      visited.add(currentParentId);

      const currentCategory = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId = currentCategory?.parentId ?? null;
    }
  }

  private async ensureNoDuplicateCategoryName(
    name: string,
    excludeCategoryId?: number,
  ) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        ...(excludeCategoryId && {
          id: {
            not: excludeCategoryId,
          },
        }),
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }
  }

  private normalizeCategoryName(name: string) {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return name;
    }

    return `${trimmedName.charAt(0).toUpperCase()}${trimmedName.slice(1)}`;
  }
}
