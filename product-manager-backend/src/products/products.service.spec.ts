import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const prismaMock = {
    $transaction: jest.fn(),
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productCategory: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const txMock = {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productCategory: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const validCreateDto = {
    name: 'Notebook',
    description: '15 inch',
    price: 100,
    categoryIds: [1],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );

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

  it('create should persist product and category relations', async () => {
    prismaMock.category.count.mockResolvedValue(1);
    prismaMock.category.findMany.mockResolvedValue([{ id: 1, parentId: null }]);
    txMock.product.create.mockResolvedValue({ id: 10 });
    txMock.product.findUnique.mockResolvedValue({
      id: 10,
      name: 'Notebook',
      categories: [],
    });

    const result = await service.create(validCreateDto);

    expect(prismaMock.category.count).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
    });
    expect(txMock.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Notebook',
        description: '15 inch',
        price: 100,
      },
    });
    expect(txMock.productCategory.createMany).toHaveBeenCalledWith({
      data: [{ productId: 10, categoryId: 1 }],
    });
    expect(result).toEqual({ id: 10, name: 'Notebook', categories: [] });
  });

  it('create should reject when categoryIds is empty', async () => {
    await expect(
      service.create({ ...validCreateDto, categoryIds: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should reject when any category does not exist', async () => {
    prismaMock.category.count.mockResolvedValue(1);

    await expect(
      service.create({ ...validCreateDto, categoryIds: [1, 2] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should reject when categories share the same parent', async () => {
    prismaMock.category.count.mockResolvedValue(2);
    prismaMock.category.findMany.mockResolvedValue([
      { id: 10, parentId: 5 },
      { id: 11, parentId: 5 },
    ]);

    await expect(
      service.create({ ...validCreateDto, categoryIds: [10, 11] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should allow categories from different parents', async () => {
    prismaMock.category.count.mockResolvedValue(2);
    prismaMock.category.findMany.mockResolvedValue([
      { id: 10, parentId: 1 },
      { id: 11, parentId: 2 },
    ]);
    txMock.product.create.mockResolvedValue({ id: 99 });
    txMock.product.findUnique.mockResolvedValue({ id: 99, categories: [] });

    await service.create({ ...validCreateDto, categoryIds: [10, 11] });

    expect(txMock.productCategory.createMany).toHaveBeenCalledWith({
      data: [
        { productId: 99, categoryId: 10 },
        { productId: 99, categoryId: 11 },
      ],
    });
  });

  it('getAll should search products by name ignoring case', async () => {
    const products = [
      { id: 1, name: 'Notebook', description: 'desc', price: 100 },
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
    });
  });

  it('getAll should return all products when filter is not provided', async () => {
    const products = [{ id: 1, name: 'Mouse' }];
    prismaMock.product.findMany.mockResolvedValue(products);

    const result = await service.getAll();

    expect(result).toEqual(products);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith();
  });

  it('getOne should return a product when it exists', async () => {
    const product = { id: 1, name: 'Notebook', categories: [] };
    prismaMock.product.findUnique.mockResolvedValue(product);

    const result = await service.getOne(1);

    expect(result).toEqual(product);
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  });

  it('getOne should throw NotFoundException when product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.getOne(777)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should modify product and replace category relations', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({ id: 1 });
    prismaMock.category.count.mockResolvedValue(2);
    prismaMock.category.findMany.mockResolvedValue([
      { id: 10, parentId: 1 },
      { id: 11, parentId: 2 },
    ]);
    txMock.product.findUnique.mockResolvedValue({ id: 1, categories: [] });

    const result = await service.update(1, {
      name: 'Updated',
      categoryIds: [10, 11],
    });

    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated' },
    });
    expect(txMock.productCategory.deleteMany).toHaveBeenCalledWith({
      where: { productId: 1 },
    });
    expect(txMock.productCategory.createMany).toHaveBeenCalledWith({
      data: [
        { productId: 1, categoryId: 10 },
        { productId: 1, categoryId: 11 },
      ],
    });
    expect(result).toEqual({ id: 1, categories: [] });
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
