import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Code } from '../codes/code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [SeedService],
})
export class SeedModule {}