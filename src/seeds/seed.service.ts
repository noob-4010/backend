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
      await this.seedCodes();
      await this.seedIcdCodes();
      await this.seedConceptMaps();
      this.logger.log('🌱 All seeders executed successfully');
    } catch (err) {
      this.logger.error('❌ Seeding failed', err);
    }
  }

  private async seedCodes() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-namaste.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.warn('⚠️ NAMASTE CSV not found, skipping');
      return;
    }

    const records: Partial<Code>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => records.push(row))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Code);
      await repo.clear();
      await repo.save(records);
    });

    this.logger.log(`✅ NAMASTE seed complete — inserted ${records.length} codes`);
  }

  private async seedIcdCodes() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-icd.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.warn('⚠️ ICD CSV not found, skipping');
      return;
    }

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
      await repo.clear();
      await repo.save(records);
    });

    this.logger.log(`✅ ICD seed complete — inserted ${records.length} codes`);
  }

  private async seedConceptMaps() {
    const csvPath = path.resolve(process.cwd(), 'src/seeds/mock-conceptmap.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.warn('⚠️ ConceptMap CSV not found, skipping');
      return;
    }

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
      await repo.clear();
      await repo.save(records);
    });

    this.logger.log(`✅ ConceptMap seed complete — inserted ${records.length} mappings`);
  }
}