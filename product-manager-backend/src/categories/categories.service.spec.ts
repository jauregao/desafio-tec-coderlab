import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const prismaMock = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAll should return categories from prisma', async () => {
    const categories = [{ id: 1, name: 'cat1' }];
    prismaMock.category.findMany.mockResolvedValue(categories);
    const result = await service.getAll();
    expect(result).toEqual(categories);
    expect(prismaMock.category.findMany).toHaveBeenCalled();
  });

  it('create should persist root category when parentId is not provided', async () => {
    const created = { id: 1, name: 'Root' };
    prismaMock.category.create.mockResolvedValue(created);

    const result = await service.create({ name: 'Root' });

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: { name: 'Root', parentId: undefined },
    });
    expect(result).toEqual(created);
  });

  it('create should persist child category when parentId exists', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 10 });
    prismaMock.category.create.mockResolvedValue({ id: 11, parentId: 10 });

    const result = await service.create({ name: 'Child', parentId: 10 });

    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
      select: { id: true },
    });
    expect(result).toEqual({ id: 11, parentId: 10 });
  });

  it('create should throw NotFoundException when parentId does not exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ name: 'Child', parentId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should update only name', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.category.update.mockResolvedValue({ id: 1, name: 'Updated' });

    const result = await service.update(1, { name: 'Updated' });

    expect(prismaMock.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated' },
    });
    expect(result).toEqual({ id: 1, name: 'Updated' });
  });

  it('update should update parentId when target parent is valid', async () => {
    prismaMock.category.findUnique
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 3 })
      .mockResolvedValueOnce({ parentId: null });
    prismaMock.category.update.mockResolvedValue({ id: 1, parentId: 3 });

    const result = await service.update(1, { parentId: 3 });

    expect(result).toEqual({ id: 1, parentId: 3 });
  });

  it('update should throw BadRequestException for self loop', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1 });

    await expect(service.update(1, { parentId: 1 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update should throw BadRequestException for indirect loop', async () => {
    prismaMock.category.findUnique
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 })
      .mockResolvedValueOnce({ parentId: 1 });

    await expect(service.update(1, { parentId: 2 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update should throw BadRequestException when no valid fields are provided', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1 });

    await expect(service.update(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update should throw NotFoundException when category does not exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(service.update(123, { name: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
