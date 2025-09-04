import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express'; // ✅ important for TS
import { CodesService } from './codes.service';

@Controller('codes')
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Get()
  async getAllCodes(@Res() res: Response) {
    const codes = await this.codesService.findAll();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(codes, null, 2)); // pretty print JSON
  }
}