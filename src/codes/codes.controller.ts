// src/codes/codes.controller.ts
import { Controller, Get, Post, Body, Res, Query, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { CodesService } from './codes.service';
import { CsvIngestDto } from './dto/csv-ingest.dto';

@Controller('codes') // ✅ global prefix handles 'api'
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  // ✅ GET all codes
  @Get()
  async getAllCodes(@Res() res: Response) {
    const codes = await this.codesService.findAll();
    return res.status(200).json(codes);
  }

  // ✅ GET FHIR ValueSet
  @Get('valuesets')
  async getValueSet(@Res() res: Response) {
    const valueSet = await this.codesService.getValueSet();
    return res.status(200).json(valueSet);
  }

  // ✅ GET FHIR ConceptMap
  @Get('conceptmap')
  async getConceptMap(@Query('targetSystem') targetSystem: string, @Res() res: Response) {
    if (!targetSystem) {
      throw new BadRequestException('targetSystem query parameter is required');
    }
    const conceptMap = await this.codesService.getConceptMap(targetSystem);
    return res.status(200).json(conceptMap);
  }

  // ✅ GET Auto-complete
  @Get('autocomplete')
  async autoComplete(
    @Query('query') query: string,
    @Query('limit') limit: string,
    @Res() res: Response,
  ) {
    if (!query) {
      throw new BadRequestException('query parameter is required');
    }
    const n = limit ? parseInt(limit, 10) : 10;
    const results = await this.codesService.autoComplete(query, n);
    return res.status(200).json(results);
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

  // ✅ POST /codes/sync-icd to populate ConceptMap from icd11.csv
  @Post('sync-icd')
  async syncIcdCodes() {
    return this.codesService.syncIcdCodes();
  }
}