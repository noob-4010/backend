import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesService } from './codes.service';
import { CodesController } from './codes.controller';
import { Code } from './code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [CodesService],
  controllers: [CodesController],
})
export class CodesModule {}