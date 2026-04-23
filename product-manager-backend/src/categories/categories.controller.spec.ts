import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const serviceMock = {
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAll should return categories from service', async () => {
    const categories = [{ id: 1, name: 'cat1' }];
    serviceMock.getAll.mockResolvedValue(categories);
    const result = await controller.getAll();
    expect(result).toEqual(categories);
    expect(serviceMock.getAll).toHaveBeenCalled();
  });
});
