// src/main.ts
import * as crypto from 'crypto';   // ✅ Import Node's crypto
(global as any).crypto = crypto;    // ✅ Patch crypto globally

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for both local dev & deployed frontend
  app.enableCors({
    origin: [
      'http://127.0.0.1:5500',   // local frontend
      '*'                        // fallback (any domain, e.g. Render hosted frontend)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Prefix all API routes, but keep root `/` unprefixed
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();