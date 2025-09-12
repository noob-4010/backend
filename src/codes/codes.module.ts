import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesService } from './codes.service';
import { CodesController } from './codes.controller';
import { Code } from './code.entity';
import { ConceptMap } from './concept-map.entity';
import { IcdApiService } from './icd-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Code, ConceptMap])],
  providers: [CodesService, IcdApiService],
  controllers: [CodesController],
  exports: [TypeOrmModule.forFeature([Code])], // ✅ export the repository for AppController
})
export class CodesModule {}