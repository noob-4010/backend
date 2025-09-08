// src/seeds/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Code } from '../codes/code.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Code) private readonly codeRepo: Repository<Code>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      // Always load JSON from backend root
      const seedPath = path.resolve(process.cwd(), 'seed-data.json');

      if (!fs.existsSync(seedPath)) {
        this.logger.warn(`No seed-data.json found at ${seedPath} — skipping seed.`);
        return;
      }

      const raw = fs.readFileSync(seedPath, 'utf8');
      const codes: Partial<Code>[] = JSON.parse(raw);

      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Code);
        await repo.clear(); // Truncate table before seeding
        await repo.save(codes);
      });

      this.logger.log(`Seed complete — inserted ${codes.length} codes.`);
    } catch (err) {
      this.logger.error('Seeding failed', err);
    }
  }
}