// codes.service.ts
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

  // Return all codes
  async findAll(): Promise<Code[]> {
    return this.codeRepository.find();
  }

  // ValueSet returns only NAMASTE codes (no duplicates)
  async getValueSet(): Promise<any> {
    const codes = await this.codeRepository.find();
    const namasteCodes = codes
      .filter(c => c.system === 'NAMASTE')
      .filter(
        (code, index, self) =>
          index === self.findIndex(c => c.code === code.code),
      );

    return {
      resourceType: 'ValueSet',
      id: 'ayush-valueset',
      status: 'active',
      compose: {
        include: [
          {
            system: 'NAMASTE',
            concept: namasteCodes.map(c => ({
              code: c.code,
              display: c.name,
            })),
          },
        ],
      },
    };
  }

  // ConceptMap for a target system (TM2, Biomed, etc.)
  async getConceptMap(targetSystem: string): Promise<any> {
    const maps = await this.conceptMapRepository.find({
      where: { target_system: targetSystem },
    });

    // Remove duplicate source-target pairs
    const uniqueMaps = maps.filter(
      (map, index, self) =>
        index ===
        self.findIndex(
          m => m.source_code === map.source_code && m.target_code === map.target_code,
        ),
    );

    // Fill display from Code repository
    const elements = await Promise.all(
      uniqueMaps.map(async m => {
        const targetCode = await this.codeRepository.findOne({
          where: { code: m.target_code },
        });
        return {
          code: m.source_code,
          target: [
            {
              code: m.target_code,
              display: targetCode ? targetCode.name : '',
            },
          ],
        };
      }),
    );

    return {
      resourceType: 'ConceptMap',
      id: `map-${targetSystem}`,
      group: [
        {
          source: 'NAMASTE',
          target: targetSystem,
          element: elements,
        },
      ],
    };
  }

  // Autocomplete by code name
  async autoComplete(query: string, n: number): Promise<Code[]> {
    return this.codeRepository.find({
      where: { name: ILike(`%${query}%`) },
      take: n,
    });
  }

  // Ingest CSV file
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

  // Create a code entry
  async create(row: any): Promise<Code> {
    const code = this.codeRepository.create({
      system: row.system || 'NAMASTE',
      code: row.code,
      name: row.name,
      description: row.description,
    });
    return this.codeRepository.save(code);
  }

  // Sync ICD codes from WHO (sample)
  async syncIcdCodes(): Promise<{ message: string }> {
    try {
      const response = await axios.get(
        'https://id.who.int/icd/release/11/mms/foundation',
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

  // 🔥 Translate NAMASTE → TM2 → Biomed → ICD11
  async translateCode(code: string) {
    // 1. Get NAMASTE code
    const namaste = await this.codeRepository.findOne({
      where: { system: 'NAMASTE', code },
    });

    if (!namaste) {
      throw new NotFoundException(`Code ${code} not found in NAMASTE`);
    }

    // 2. Get mappings (TM2 + Biomed)
    const mappings = await this.conceptMapRepository.find({
      where: { source_code: code },
    });

    const tm2 = mappings.find(m => m.target_system === 'TM2');
    const biomed = mappings.find(m => m.target_system === 'Biomed');

    // 3. Get ICD11 if Biomed exists
    let icd11: IcdCode | null = null;
    if (biomed) {
      icd11 = await this.icdCodeRepository.findOne({
        where: { code: biomed.target_code },
      });
    }

    // 4. Resolve names safely
    const tm2Display =
      tm2 &&
      (await this.codeRepository.findOne({ where: { code: tm2.target_code } }))
        ?.name;

    const biomedDisplay =
      biomed &&
      (await this.codeRepository.findOne({ where: { code: biomed.target_code } }))
        ?.name;

    // 5. Build structured response
    return {
      namaste: {
        code: namaste.code,
        display: namaste.name,
        system: namaste.system,
      },
      tm2: tm2
        ? {
            code: tm2.target_code,
            display: tm2Display || tm2.target_code,
            system: 'TM2',
          }
        : null,
      biomed: biomed
        ? {
            code: biomed.target_code,
            display: biomedDisplay || biomed.target_code,
            system: 'Biomed',
          }
        : null,
      icd11: icd11
        ? {
            code: icd11.code,
            display: icd11.name,
            system: 'ICD11',
          }
        : null,
    };
  }
}