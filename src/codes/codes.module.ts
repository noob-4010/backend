// src/codes/codes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './code.entity';
import { IcdCode } from './icd-code.entity';
import { ConceptMap } from './concept-map.entity';
import { CodesService } from './codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Code, IcdCode, ConceptMap])],
  providers: [CodesService],
  exports: [CodesService, TypeOrmModule], // ✅ Export repository for AppController
})
export class CodesModule {}