import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from '../codes/code.entity';
import { IcdCode } from '../codes/icd-code.entity';
import { ConceptMap } from '../codes/concept-map.entity';

export interface Translation {
  namasteCode: string;
  namasteTerm: string;
  mappings: {
    icd11_tm2: { code: string; term: string };
    icd11_biomed: { code: string; term: string };
  };
}

@Injectable()
export class TranslateService {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,

    @InjectRepository(IcdCode)
    private readonly biomedRepo: Repository<IcdCode>,

    @InjectRepository(ConceptMap)
    private readonly conceptMapRepo: Repository<ConceptMap>,
  ) {}

  async getTranslation(code: string): Promise<Translation | null> {
    const codeEntity = await this.codeRepo.findOne({ where: { code } });
    if (!codeEntity) return null;

    // TM2 mapping
    let tm2Code = '';
    let tm2Term = '';
    if (codeEntity.tm2Code) {
      const tm2Entity = await this.codeRepo.findOne({ where: { code: codeEntity.tm2Code } });
      tm2Code = tm2Entity?.code || codeEntity.tm2Code;
      tm2Term = tm2Entity?.name || codeEntity.tm2Code;
    }

    // Biomed mapping
    let biomedCode = '';
    let biomedTerm = '';
    if (codeEntity.icd11TM2Code) {
      const biomedEntity = await this.biomedRepo.findOne({ where: { code: codeEntity.icd11TM2Code } });
      biomedCode = biomedEntity?.code || codeEntity.icd11TM2Code;
      biomedTerm = biomedEntity?.name || codeEntity.icd11TM2Code;
    }

    return {
      namasteCode: codeEntity.code,
      namasteTerm: codeEntity.name,
      mappings: {
        icd11_tm2: { code: tm2Code || 'UNKNOWN', term: tm2Term || 'UNKNOWN' },
        icd11_biomed: { code: biomedCode || 'UNKNOWN', term: biomedTerm || 'UNKNOWN' },
      },
    };
  }
}