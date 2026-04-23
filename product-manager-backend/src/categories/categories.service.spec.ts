import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const prismaMock = {
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
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
});
