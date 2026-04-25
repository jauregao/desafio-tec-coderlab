import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const serviceMock = {
    create: jest.fn(),
    getAll: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create', async () => {
    const dto = {
      name: 'Notebook',
      description: 'desc',
      price: 10,
      categoryId: 1,
    };
    const expected = { id: 1, ...dto };
    serviceMock.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should call service.getAll with name filter', async () => {
    const expected = [{ id: 1, name: 'Notebook' }];
    serviceMock.getAll.mockResolvedValue(expected);

    const result = await controller.findAll('note');

    expect(result).toEqual(expected);
    expect(serviceMock.getAll).toHaveBeenCalledWith('note');
  });

  it('findOne should call service.getOne', async () => {
    const expected = { id: 1, name: 'Notebook' };
    serviceMock.getOne.mockResolvedValue(expected);

    const result = await controller.findOne(1);

    expect(result).toEqual(expected);
    expect(serviceMock.getOne).toHaveBeenCalledWith(1);
  });

  it('update should call service.update', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: 1, name: 'Updated' };
    serviceMock.update.mockResolvedValue(expected);

    const result = await controller.update(1, dto);

    expect(result).toEqual(expected);
    expect(serviceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove should call service.remove', async () => {
    const expected = { message: 'ok' };
    serviceMock.remove.mockResolvedValue(expected);

    const result = await controller.remove(1);

    expect(result).toEqual(expected);
    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});
