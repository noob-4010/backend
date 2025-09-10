import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from './code.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { CsvIngestDto } from './dto/csv-ingest.dto';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code)
    private codesRepo: Repository<Code>,
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

  // ✅ Ingest CSV from server file
  async ingestCsv(filePath: string): Promise<{ message: string }> {
    const fullPath = path.resolve(filePath); // Ensure absolute path
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

    // Insert all records sequentially
    for (const row of results) {
      await this.create(row);
    }

    return { message: `CSV data ingested successfully — ${results.length} rows inserted` };
  }
}