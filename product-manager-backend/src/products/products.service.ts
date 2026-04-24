import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryIds, ...productData } = createProductDto;

    await this.ensureCategoriesExist(categoryIds);
    await this.ensureNoSiblingCategories(categoryIds);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: productData });

      await tx.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
        })),
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  }

  async getAll(name?: string) {
    if (name) {
      return this.prisma.product.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });
    }

    return this.prisma.product.findMany();
  }

  async getOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const { categoryIds, ...productData } = updateProductDto;

    if (categoryIds) {
      await this.ensureCategoriesExist(categoryIds);
      await this.ensureNoSiblingCategories(categoryIds);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      if (categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            productId: id,
            categoryId,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  }

  async remove(id: number) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: `Product with id ${id} deleted successfully` };
  }

  private async ensureCategoriesExist(categoryIds: number[]) {
    const uniqueCategoryIds = [...new Set(categoryIds)];

    if (uniqueCategoryIds.length === 0) {
      throw new BadRequestException('Product must have at least one category');
    }

    const categoriesCount = await this.prisma.category.count({
      where: { id: { in: uniqueCategoryIds } },
    });

    if (categoriesCount !== uniqueCategoryIds.length) {
      throw new BadRequestException('One or more categories do not exist');
    }
  }

  private async ensureNoSiblingCategories(categoryIds: number[]) {
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    const parentIds = categories
      .map((c) => c.parentId)
      .filter((p) => p !== null);

    const uniqueParentIds = new Set(parentIds);

    if (uniqueParentIds.size !== parentIds.length) {
      throw new BadRequestException(
        'Product cannot have multiple categories with the same parent',
      );
    }
  }
}
