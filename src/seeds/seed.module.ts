import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Code } from '../codes/code.entity';
import { IcdCode } from '../codes/icd-code.entity';
import { ConceptMap } from '../codes/concept-map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Code, IcdCode, ConceptMap])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}