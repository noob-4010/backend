// src/translate/translate.module.ts
import { Module } from '@nestjs/common';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from '../codes/code.entity';
import { IcdCode } from '../codes/icd-code.entity';
import { ConceptMap } from '../codes/concept-map.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Code, IcdCode, ConceptMap]),
  ],
  controllers: [TranslateController],
  providers: [TranslateService], // ✅ Add service here
  exports: [TranslateService],   // ✅ Export it if other modules need it
})
export class TranslateModule {}