// src/seeds/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Code } from '../codes/code.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

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
      // ✅ Try CSV first, fallback to JSON if not found
      const csvPath = path.resolve(process.cwd(), 'src/seeds/namaste.csv');
      const jsonPath = path.resolve(process.cwd(), 'seed-data.json');

      let records: Partial<Code>[] = [];

      if (fs.existsSync(csvPath)) {
        this.logger.log(`Found CSV at ${csvPath}, seeding...`);
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (row) => records.push(row))
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });
      } else if (fs.existsSync(jsonPath)) {
        this.logger.log(`CSV not found, falling back to JSON: ${jsonPath}`);
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        records = JSON.parse(raw);
      } else {
        this.logger.warn('⚠️ No seed file found — skipping seeding.');
        return;
      }

      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Code);
        await repo.clear(); // truncate table before seeding
        await repo.save(records);
      });

      this.logger.log(`✅ Seed complete — inserted ${records.length} codes.`);
    } catch (err) {
      this.logger.error('❌ Seeding failed', err);
    }
  }
}