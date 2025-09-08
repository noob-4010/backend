// src/seeds/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Code } from '../codes/code.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser'; // ✅ fixed import

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      const csvPath = path.resolve(process.cwd(), 'src/seeds/namaste.csv');

      if (!fs.existsSync(csvPath)) {
        this.logger.warn(`No CSV found at ${csvPath} — skipping seed.`);
        return;
      }

      const records: Partial<Code>[] = [];

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csvParser()) // ✅ now callable
          .on('data', (row) => records.push(row))
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Code);
        await repo.clear(); // truncate table before seeding
        await repo.save(records);
      });

      this.logger.log(`CSV Seed complete — inserted ${records.length} codes.`);
    } catch (err) {
      this.logger.error('Seeding failed', err);
    }
  }
}