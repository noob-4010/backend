// src/bundle/bundle.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from '../codes/code.entity';
import { IcdCode } from '../codes/icd-code.entity';
import { ConceptMap } from '../codes/concept-map.entity';
import { BundleController } from './bundle.controller';
import { TranslateModule } from '../translate/translate.module'; // ✅ import TranslateModule

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Code, IcdCode, ConceptMap]), // ✅ inject repositories
    TranslateModule, // ✅ make TranslateService available for DI
  ],
  controllers: [BundleController],
})
export class BundleModule {}