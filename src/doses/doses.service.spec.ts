import { Test, TestingModule } from '@nestjs/testing';
import { DosesService } from './doses.service';

describe('DosesService', () => {
  let service: DosesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DosesService],
    }).compile();

    service = module.get<DosesService>(DosesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
