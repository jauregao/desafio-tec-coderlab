import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const serviceMock = {
    create: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
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

  it('create should call service.create', async () => {
    const dto = { name: 'Electronics' };
    const expected = { id: 1, name: 'Electronics' };
    serviceMock.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('update should call service.update', async () => {
    const dto = { parentId: 2 };
    const expected = { id: 1, parentId: 2 };
    serviceMock.update.mockResolvedValue(expected);

    const result = await controller.update(1, dto);

    expect(result).toEqual(expected);
    expect(serviceMock.update).toHaveBeenCalledWith(1, dto);
  });
});
