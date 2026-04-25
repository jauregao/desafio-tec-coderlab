import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const prismaMock = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const validCreateDto = {
    name: 'Notebook',
    description: '15 inch',
    price: 100,
    categoryId: 10,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should persist product with one category', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 10 });
    prismaMock.product.create.mockResolvedValue({
      id: 10,
      name: 'Notebook',
      categoryId: 10,
      category: { id: 10, name: 'Notebooks', parentId: 1 },
    });

    const result = await service.create(validCreateDto);

    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
      select: { id: true },
    });
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: validCreateDto,
      include: {
        category: true,
      },
    });
    expect(result).toEqual({
      id: 10,
      name: 'Notebook',
      categoryId: 10,
      category: { id: 10, name: 'Notebooks', parentId: 1 },
    });
  });

  it('create should reject when category does not exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(service.create(validCreateDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getAll should search products by name ignoring case', async () => {
    const products = [
      {
        id: 1,
        name: 'Notebook',
        description: 'desc',
        price: 100,
        categoryId: 10,
      },
    ];
    prismaMock.product.findMany.mockResolvedValue(products);

    const result = await service.getAll('note');

    expect(result).toEqual(products);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'note',
          mode: 'insensitive',
        },
      },
      include: {
        category: true,
      },
    });
  });

  it('getAll should return all products when filter is not provided', async () => {
    const products = [{ id: 1, name: 'Mouse', categoryId: 2 }];
    prismaMock.product.findMany.mockResolvedValue(products);

    const result = await service.getAll();

    expect(result).toEqual(products);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      include: {
        category: true,
      },
    });
  });

  it('getOne should return a product when it exists', async () => {
    const product = { id: 1, name: 'Notebook', categoryId: 10 };
    prismaMock.product.findUnique.mockResolvedValue(product);

    const result = await service.getOne(1);

    expect(result).toEqual(product);
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        category: true,
      },
    });
  });

  it('getOne should throw NotFoundException when product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.getOne(777)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should modify product including category', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({ id: 1 });
    prismaMock.category.findUnique.mockResolvedValue({ id: 11 });
    prismaMock.product.update.mockResolvedValue({
      id: 1,
      name: 'Updated',
      categoryId: 11,
    });

    const result = await service.update(1, {
      name: 'Updated',
      categoryId: 11,
    });

    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated', categoryId: 11 },
      include: {
        category: true,
      },
    });
    expect(result).toEqual({
      id: 1,
      name: 'Updated',
      categoryId: 11,
    });
  });

  it('update should throw NotFoundException when product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.update(123, { name: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove should delete and return success message', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1 });

    const result = await service.remove(1);

    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({
      message: 'Product with id 1 deleted successfully',
    });
  });

  it('remove should throw NotFoundException when product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
