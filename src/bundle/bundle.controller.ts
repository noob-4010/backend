import { Controller, Post, Body } from '@nestjs/common';
import { TranslateService } from '../translate/translate.service';

interface TranslationMapping {
  code?: string;
  term?: string;
}

interface Translation {
  namasteCode: string;
  namasteTerm: string;
  mappings: {
    icd11_tm2: TranslationMapping;
    icd11_biomed: TranslationMapping;
  };
}

@Controller('fhir')
export class BundleController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('bundle')
  async uploadBundle(@Body() body: any) {
    const entries: any[] = [];

    for (const entry of body.entry || []) {
      const code = entry.resource?.code?.coding?.[0]?.code;
      if (!code) continue;

      const translation: Translation | null = await this.translateService.getTranslation(code);
      if (!translation) continue;

      const { icd11_tm2, icd11_biomed } = translation.mappings;

      entries.push({
        resource: {
          resourceType: 'Condition',
          code: {
            coding: [
              { system: 'NAMASTE', code: translation.namasteCode, display: translation.namasteTerm },
              { system: 'ICD-11-TM2', code: icd11_tm2?.code || '', display: icd11_tm2?.term || '' },
              { system: 'ICD-11-Biomed', code: icd11_biomed?.code || '', display: icd11_biomed?.term || '' },
            ],
          },
        },
      });
    }

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: entries,
    };
  }
}