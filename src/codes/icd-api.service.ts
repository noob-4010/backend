// src/codes/icd-api.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

@Injectable()
export class IcdApiService {
  private readonly seedPath = path.resolve(__dirname, '../seeds');

  // Read CSV and return TM2 codes
  async getTm2Codes(): Promise<any[]> {
    const filePath = path.join(this.seedPath, 'icd11.csv');
    return this.readCsv(filePath, 'tm2Code');
  }

  // Read CSV and return Biomed codes
  async getBiomedCodes(): Promise<any[]> {
    const filePath = path.join(this.seedPath, 'icd11.csv');
    return this.readCsv(filePath, 'biomedCode');
  }

  private async readCsv(filePath: string, targetField: string): Promise<any[]> {
    if (!fs.existsSync(filePath)) return [];

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data: any) => {
          results.push({
            code: data[targetField],
            namasteCode: data.tm2Code.startsWith('TM2') ? data.tm2Code.replace('TM2-', 'AYU00') : '', // optional mapping
            name: data.name,
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    return results;
  }
}