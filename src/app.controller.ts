import { Controller, Get, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from './codes/code.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Root route (excluded from global prefix)
  @Get()
  getRoot() {
    return { message: 'Server is running 🚀' };
  }

  // Codes route (access via /api/codes)
  @Get('codes')
  async getCodes() {
    const cached = await this.cacheManager.get<Code[]>('codes');
    if (cached) return { source: 'cache', data: cached };

    const codes = await this.codeRepo.find();
    await this.cacheManager.set('codes', codes, 30_000); // 30 seconds
    return { source: 'db', data: codes };
  }

  // Cache test route (access via /api/cache-test)
  @Get('cache-test')
  async getCacheTest() {
    await this.cacheManager.set('hello', 'world', 10_000); // 10 seconds
    const value = await this.cacheManager.get('hello');
    return { cachedValue: value };
  }
}