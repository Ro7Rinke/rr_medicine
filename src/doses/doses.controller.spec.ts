import { Test, TestingModule } from '@nestjs/testing';
import { DosesController } from './doses.controller';

describe('DosesController', () => {
  let controller: DosesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DosesController],
    }).compile();

    controller = module.get<DosesController>(DosesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
