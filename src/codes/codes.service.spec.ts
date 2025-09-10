import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodesService } from './codes.service';
import { Code } from './code.entity';
import { CsvIngestDto } from './dto/csv-ingest.dto';

describe('CodesService', () => {
  let service: CodesService;
  let repo: Repository<Code>;

  const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodesService,
        { provide: getRepositoryToken(Code), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CodesService>(CodesService);
    repo = module.get<Repository<Code>>(getRepositoryToken(Code));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all codes', async () => {
    const dummyCodes = [{ code: 'AYU001', name: 'Vata' }];
    mockRepo.find.mockResolvedValue(dummyCodes);

    const result = await service.findAll();
    expect(result).toEqual(dummyCodes);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('should create a single code', async () => {
    const dto: CsvIngestDto = { system: 'NAMASTE', code: 'AYU002', name: 'Pitta' };
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue(dto);

    const result = await service.create(dto);
    expect(result).toEqual(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(dto);
  });
});