import { Controller, Post, Body, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from '../codes/code.entity';

@Controller('fhir')
export class BundleController {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
  ) {}

  // Translate a single code
  private async translateCode(code: string) {
    const codeEntry = await this.codeRepo.findOne({ where: { code } });

    if (!codeEntry) {
      return {
        source: 'db',
        namaste: code,
        tm2: null,
        biomed: null,
        icd11: 'UNKNOWN',
      };
    }

    return {
      source: 'db',
      namaste: codeEntry.code,
      tm2: codeEntry.tm2Code,
      biomed: codeEntry.biomedCode,
      icd11: codeEntry.biomedCode || 'UNKNOWN', // adjust if you have a separate ICD-11 mapping
    };
  }

  @Post('bundle')
  async uploadBundle(@Body() body: { codes: string[] }) {
    const results: Record<string, any> = {};

    for (const code of body.codes) {
      results[code] = await this.translateCode(code);
    }

    return results;
  }
}