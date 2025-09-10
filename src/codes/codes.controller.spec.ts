import { Test, TestingModule } from '@nestjs/testing';
import { CodesController } from './codes.controller';
import { CodesService } from './codes.service';
import { CsvIngestDto } from './dto/csv-ingest.dto';

describe('CodesController', () => {
  let controller: CodesController;
  let service: CodesService;

  const mockCodesService = {
    findAll: jest.fn().mockResolvedValue([{ system: 'NAMASTE', code: 'AYU001', name: 'Vata Dosha' }]),
    create: jest.fn().mockResolvedValue(true),
    ingestCsv: jest.fn().mockResolvedValue({ message: 'CSV data ingested successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodesController],
      providers: [{ provide: CodesService, useValue: mockCodesService }],
    }).compile();

    controller = module.get<CodesController>(CodesController);
    service = module.get<CodesService>(CodesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllCodes should return codes', async () => {
    const jsonMock = jest.fn();
    const res: any = { status: jest.fn().mockReturnValue({ json: jsonMock }) };
    await controller.getAllCodes(res);
    expect(service.findAll).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith([{ system: 'NAMASTE', code: 'AYU001', name: 'Vata Dosha' }]);
  });

  it('ingestCsvFile should call service.ingestCsv', async () => {
    await controller.ingestCsvFile({ filePath: 'dummy.csv' });
    expect(service.ingestCsv).toHaveBeenCalledWith('dummy.csv');
  });

  it('ingestCsvJson should call service.create', async () => {
    const csvData: CsvIngestDto[] = [{ system: 'NAMASTE', code: 'AYU002', name: 'Pitta Dosha' }];
    await controller.ingestCsvJson(csvData);
    expect(service.create).toHaveBeenCalledWith(csvData[0]);
  });
});