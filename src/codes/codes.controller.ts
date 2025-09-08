// src/codes/codes.controller.ts
import { Controller, Get, Post, Body, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { CodesService } from './codes.service';
import { CsvIngestDto } from './dto/csv-ingest.dto';

@Controller('codes') // ✅ remove "api" (global prefix handles it)
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  // ✅ GET all codes
  @Get()
  async getAllCodes(@Res() res: Response) {
    const codes = await this.codesService.findAll();
    return res.status(200).json(codes);
  }

  // ✅ POST CSV file ingestion (server-side file)
  @Post('csv-file')
  async ingestCsvFile(@Body() body: { filePath: string }) {
    if (!body?.filePath) {
      throw new BadRequestException('filePath is required');
    }

    try {
      const result = await this.codesService.ingestCsv(body.filePath);
      return { status: 'success', ...result };
    } catch (err) {
      return {
        status: 'error',
        message: 'Failed to ingest CSV file',
        error: err.message,
      };
    }
  }

  // ✅ POST JSON array ingestion (from frontend / Postman)
  @Post('csv-json')
  async ingestCsvJson(@Body() csvData: CsvIngestDto[]) {
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      throw new BadRequestException('CSV data must be a non-empty array');
    }

    try {
      for (const row of csvData) {
        await this.codesService.create(row);
      }
      return {
        status: 'success',
        message: `CSV/JSON data ingested successfully — ${csvData.length} rows`,
      };
    } catch (err) {
      return {
        status: 'error',
        message: 'Failed to ingest JSON',
        error: err.message,
      };
    }
  }
}