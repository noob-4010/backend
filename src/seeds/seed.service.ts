// src/seeds/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Code } from '../codes/code.entity';
import { IcdCode } from '../codes/icd-code.entity';
import { ConceptMap } from '../codes/concept-map.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
    @InjectRepository(IcdCode)
    private readonly icdRepo: Repository<IcdCode>,
    @InjectRepository(ConceptMap)
    private readonly conceptMapRepo: Repository<ConceptMap>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.seedCodes();         // NAMASTE
      await this.seedIcdCodes();      // ICD Biomedicine
      await this.seedTm2Codes();      // ICD TM2
      await this.seedConceptMaps();   // Mapping
      await this.mergeConceptMaps();  // Populate tm2Code + icd11Code in Codes
      this.logger.log('🌱 All seeders executed successfully');
    } catch (err) {
      this.logger.error('❌ Seeding failed', err);
    }
  }

  // -------------------------------
  // NAMASTE codes
  // -------------------------------
  private async seedCodes() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-namaste.csv');
    if (!fs.existsSync(csvPath)) return;

    const records: Partial<Code>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => records.push({ ...row, system: 'NAMASTE' }))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Code);
      for (const r of records) {
        const existing = await repo.findOne({ where: { code: r.code } });
        if (existing) {
          existing.name = r.name || existing.name;
          existing.description = r.description || existing.description;
          await repo.save(existing);
        } else {
          await repo.save(r);
        }
      }
    });

    this.logger.log(`✅ NAMASTE seed complete — inserted/updated ${records.length} codes`);
  }

  // -------------------------------
  // ICD Biomedicine codes
  // -------------------------------
  private async seedIcdCodes() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-icd.csv');
    if (!fs.existsSync(csvPath)) return;

    const records: Partial<IcdCode>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => records.push(row))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(IcdCode);
      await repo.save(records);
    });

    this.logger.log(`✅ ICD seed complete — inserted ${records.length} codes`);
  }

  // -------------------------------
  // ICD TM2 codes
  // -------------------------------
  private async seedTm2Codes() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-tm2.csv');
    if (!fs.existsSync(csvPath)) return;

    const records: Partial<Code>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => records.push({ ...row, system: 'ICD11-TM2' }))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Code);
      await repo.save(records);
    });

    this.logger.log(`✅ TM2 seed complete — inserted ${records.length} codes`);
  }

  // -------------------------------
  // Concept maps
  // -------------------------------
  private async seedConceptMaps() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-conceptmap.csv');
    if (!fs.existsSync(csvPath)) return;

    const records: Partial<ConceptMap>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => records.push(row))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ConceptMap);
      await repo.save(records);
    });

    this.logger.log(`✅ ConceptMap seed complete — inserted ${records.length} mappings`);
  }

  // -------------------------------
  // Merge TM2 + ICD11 into Codes
  // -------------------------------
  private async mergeConceptMaps() {
    const conceptMaps = await this.conceptMapRepo.find();
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Code);
      for (const map of conceptMaps) {
        const code = await repo.findOne({ where: { code: map.source_code } });
        if (!code) continue;

        if (map.target_system === 'TM2') code.tm2Code = map.target_code;
        if (map.target_system === 'ICD11') code.icd11TM2Code = map.target_code;

        await repo.save(code);
      }
    });

    this.logger.log(`🔗 ConceptMaps merged into Codes successfully`);
  }
}