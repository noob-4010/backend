// src/codes/codes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './code.entity';
import { IcdCode } from './icd-code.entity';
import { ConceptMap } from './concept-map.entity';
import { CodesService } from './codes.service';
import { CodesController } from './codes.controller'; // ✅ Import the controller

@Module({
  imports: [TypeOrmModule.forFeature([Code, IcdCode, ConceptMap])],
  controllers: [CodesController], // ✅ Register the controller
  providers: [CodesService],
  exports: [CodesService, TypeOrmModule], // Keep export for AppController
})
export class CodesModule {}