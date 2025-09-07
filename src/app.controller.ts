// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from './codes/code.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
  ) {}

  // Root route
  @Get()
  getRoot() {
    return { message: 'Server is running 🚀' };
  }

  // /api/codes route
  @Get('api/codes')
  async getCodes() {
    return this.codeRepo.find();
  }
}