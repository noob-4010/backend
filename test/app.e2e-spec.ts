import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { CsvIngestDto } from '../src/codes/dto/csv-ingest.dto';
import * as path from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Root endpoint
  it('GET / should return root message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'Server is running 🚀' });
  });

  // GET all codes
  it('GET /api/codes should return codes array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/codes')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  // POST CSV JSON ingestion
  it('POST /api/codes/csv-json should ingest CSV JSON data', async () => {
    const csvData: CsvIngestDto[] = [
      { system: 'NAMASTE', code: 'AYU001', name: 'Vata Dosha' },
      { system: 'NAMASTE', code: 'AYU002', name: 'Pitta Dosha' },
    ];

    const response = await request(app.getHttpServer())
      .post('/api/codes/csv-json')
      .send(csvData)
      .expect(201);

    expect(response.body.status).toBe('success');
  });

  // POST CSV file ingestion
  it('POST /api/codes/csv-file should ingest CSV from file', async () => {
    const csvFilePath = path.join(__dirname, 'data', 'dummy.csv'); 
    // Make sure test/data/dummy.csv exists

    const response = await request(app.getHttpServer())
      .post('/api/codes/csv-file')
      .send({ filePath: csvFilePath })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toMatch(/CSV data ingested successfully/);
  });
});