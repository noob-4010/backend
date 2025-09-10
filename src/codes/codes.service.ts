// src/codes/codes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Code } from './code.entity';
import { ConceptMap } from './concept-map.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { CsvIngestDto } from './dto/csv-ingest.dto';
import { IcdApiService } from './icd-api.service'; // optional for later real ICD API

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code)
    private codesRepo: Repository<Code>,
    @InjectRepository(ConceptMap)
    private conceptMapRepo: Repository<ConceptMap>,
    private readonly icdApiService: IcdApiService, // for future ICD API
  ) {}

  // Fetch all codes
  findAll(): Promise<Code[]> {
    return this.codesRepo.find();
  }

  // Create a single code
  async create(codeData: CsvIngestDto): Promise<Code> {
    const code = this.codesRepo.create(codeData);
    return this.codesRepo.save(code);
  }

  // Ingest CSV file
  async ingestCsv(filePath: string): Promise<{ message: string }> {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`CSV file not found: ${fullPath}`);
    }

    const results: CsvIngestDto[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(fullPath)
        .pipe(csvParser())
        .on('data', (data: any) => {
          results.push({
            system: data.system,
            code: data.code,
            name: data.name,
            description: data.description || '',
            tm2Code: data.tm2Code || '',
            biomedCode: data.biomedCode || '',
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    for (const row of results) {
      await this.create(row);
    }

    return { message: `CSV data ingested successfully — ${results.length} rows inserted` };
  }

  // Generate FHIR ValueSet
  async getValueSet() {
    const codes = await this.codesRepo.find();
    return {
      resourceType: 'ValueSet',
      id: 'namaste-codes',
      compose: {
        include: [
          {
            system: 'NAMASTE',
            concept: codes.map(c => ({ code: c.code, display: c.name })),
          },
        ],
      },
    };
  }

  // Generate FHIR ConceptMap
  async getConceptMap(targetSystem: string) {
    const mapEntries = await this.conceptMapRepo.find({ where: { target_system: targetSystem } });
    return {
      resourceType: 'ConceptMap',
      group: [
        {
          source: 'NAMASTE',
          target: targetSystem,
          element: mapEntries.map(entry => ({
            code: entry.source_code,
            target: [{ code: entry.target_code }],
          })),
        },
      ],
    };
  }

  // Auto-complete NAMASTE codes
  async autoComplete(query: string, limit = 10) {
    const results = await this.codesRepo.find({
      where: [
        { code: ILike(`%${query}%`) },
        { name: ILike(`%${query}%`) },
      ],
      take: limit,
    });
    return results.map(r => ({ code: r.code, display: r.name }));
  }

  // Sync ICD codes from icd11.csv (for testing, before real API)
  async syncIcdCodes() {
    const icdFile = path.resolve('src/seeds/icd11.csv');
    if (!fs.existsSync(icdFile)) {
      throw new Error('ICD-11 CSV file not found');
    }

    const rows: CsvIngestDto[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(icdFile)
        .pipe(csvParser())
        .on('data', (data: any) => {
          rows.push({
            system: data.system,
            code: data.code,
            name: data.name,
            description: data.description || '',
            tm2Code: data.tm2Code || '',
            biomedCode: data.biomedCode || '',
          });
        })
        .on('end', () => resolve())
        .on('error', err => reject(err));
    });

    for (const row of rows) {
      // Populate ConceptMap for TM2
      await this.conceptMapRepo.save({
        source_code: row.code, // use ICD code as source for now
        target_code: row.tm2Code,
        target_system: 'ICD11-TM2',
      });

      // Populate ConceptMap for Biomed
      await this.conceptMapRepo.save({
        source_code: row.code,
        target_code: row.biomedCode,
        target_system: 'ICD11-Biomed',
      });
    }

    return { message: 'ICD-11 codes synced successfully from CSV' };
  }
}