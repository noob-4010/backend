import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Code } from './code.entity';
import { IcdCode } from './icd-code.entity';
import { ConceptMap } from './concept-map.entity';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import axios from 'axios';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepository: Repository<Code>,

    @InjectRepository(IcdCode)
    private readonly icdCodeRepository: Repository<IcdCode>,

    @InjectRepository(ConceptMap)
    private readonly conceptMapRepository: Repository<ConceptMap>,
  ) {}

  async findAll(): Promise<Code[]> {
    return this.codeRepository.find();
  }

  async getValueSet(): Promise<any> {
    const codes = await this.codeRepository.find();
    return {
      resourceType: 'ValueSet',
      id: 'ayush-valueset',
      status: 'active',
      compose: {
        include: [
          {
            system: 'NAMASTE',
            concept: codes.map(c => ({
              code: c.code,
              display: c.name,
            })),
          },
        ],
      },
    };
  }

  async getConceptMap(targetSystem: string): Promise<any> {
    const maps = await this.conceptMapRepository.find({
      where: { target_system: targetSystem },
    });

    return {
      resourceType: 'ConceptMap',
      id: `map-${targetSystem}`,
      group: [
        {
          source: 'NAMASTE',
          target: targetSystem,
          element: maps.map(m => ({
            code: m.source_code,
            target: [{ code: m.target_code }],
          })),
        },
      ],
    };
  }

  async autoComplete(query: string, n: number): Promise<Code[]> {
    return this.codeRepository.find({
      where: { name: ILike(`%${query}%`) },
      take: n,
    });
  }

  // ✅ Now returns an object with message property
  async ingestCsv(filePath: string): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', data => rows.push(data))
        .on('end', async () => {
          for (const row of rows) {
            await this.create(row);
          }
          resolve({ message: `✅ Ingested ${rows.length} codes from ${filePath}` });
        })
        .on('error', err => reject(err));
    });
  }

  async create(row: any): Promise<Code> {
    const code = this.codeRepository.create({
      system: row.system || 'NAMASTE',
      code: row.code,
      name: row.name,
      description: row.description,
    });
    return this.codeRepository.save(code);
  }

  // ✅ Now returns an object with message property
  async syncIcdCodes(): Promise<{ message: string }> {
    try {
      const response = await axios.get(
        'https://id.who.int/icd/release/11/mms/foundation'
      );

      const icdData = response.data;
      if (!icdData) throw new NotFoundException('No ICD data from WHO');

      // Sample entry for testing
      const sample = this.icdCodeRepository.create({
        code: 'SAMPLE',
        name: 'Sample ICD entry',
        description: 'Synced from WHO API',
      });
      await this.icdCodeRepository.save(sample);

      return { message: '✅ Synced ICD Codes (sample entry stored)' };
    } catch (err) {
      console.error(err);
      throw new Error('❌ Failed to sync ICD codes');
    }
  }
}