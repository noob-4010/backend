import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from './code.entity';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code)
    private codesRepo: Repository<Code>,
  ) {}

  findAll(): Promise<Code[]> {
    return this.codesRepo.find();
  }
}