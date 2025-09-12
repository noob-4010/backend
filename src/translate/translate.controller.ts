// src/translate/translate.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Get('map')
  async getTranslation(
    @Query('code') code: string,
  ) {
    if (!code) throw new BadRequestException('code query param required');

    const translation = await this.translateService.getTranslation(code);
    if (!translation) return { status: 'error', message: 'No translation found' };

    return {
      status: 'success',
      data: {
        namaste: { code: translation.namasteCode, term: translation.namasteTerm },
        tm2: translation.mappings.icd11_tm2,
        biomed: translation.mappings.icd11_biomed,
        icd11: translation.mappings.icd11_biomed, // for PS compliance
      },
    };
  }
}