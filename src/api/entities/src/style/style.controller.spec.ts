import { Test, TestingModule } from '@nestjs/testing';
import { StylesController } from './style.controller';

describe('StylesController', () => {
  let controller: StylesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StylesController],
    }).compile();

    controller = module.get<StylesController>(StylesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
