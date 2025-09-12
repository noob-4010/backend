import { Controller, Get, Param, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('translate')
export class TranslateController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get(':code')
  async getTranslate(@Param('code') code: string) {
    // Check cache first
    const cached = await this.cacheManager.get(`translate:${code}`);
    if (cached) return { source: 'cache', namaste: code, icd11: cached };

    // Mock mapping
    const mapping: Record<string, string> = {
      'AYU001': 'ICD-11-A1',
      'AYU002': 'ICD-11-B1',
      'AYU003': 'ICD-11-C1',
    };

    const icd11 = mapping[code] || 'UNKNOWN';

    // Store in cache for 30 seconds
    await this.cacheManager.set(`translate:${code}`, icd11, 30_000);

    return { source: 'db', namaste: code, icd11 };
  }
}