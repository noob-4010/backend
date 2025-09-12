import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from '../codes/code.entity';
import { BundleController } from './bundle.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Code]), // ✅ needed to inject CodeRepository
  ],
  controllers: [BundleController],
})
export class BundleModule {}