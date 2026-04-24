import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const LOOP_ERROR_MESSAGE = 'Category hierarchy cannot contain loops';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.ensureNoDuplicateCategoryName(
      createCategoryDto.name,
      createCategoryDto.parentId,
    );

    if (createCategoryDto.parentId !== undefined) {
      await this.ensureCategoryExists(createCategoryDto.parentId);
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        parentId: createCategoryDto.parentId,
      },
    });
  }

  async getAll() {
    return this.prisma.category.findMany();
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.ensureCategoryExists(id);

    const hasNameToUpdate = updateCategoryDto.name !== undefined;
    const hasParentIdToUpdate = updateCategoryDto.parentId !== undefined;

    if (hasParentIdToUpdate) {
      await this.ensureNoHierarchyLoop(id, updateCategoryDto.parentId);
    }

    if (!hasNameToUpdate && !hasParentIdToUpdate) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const normalizedName = hasNameToUpdate
      ? updateCategoryDto.name.trim().toLowerCase()
      : undefined;

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

  private async ensureNoDuplicateCategoryName(name: string, parentId?: number) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        parentId: parentId ?? null,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category with this name already exists in this level',
      );
    }
  }
}
