import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { webcrypto as crypto } from 'crypto'; // ✅ safer for Node 20+

// Node 20+ crypto patch
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
  app.enableCors({
    origin: ['http://127.0.0.1:5500', '*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefix all routes with /api except root /
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);

  // ✅ Safely list all registered routes
  if ((server as any)._router?.stack) {
    (server as any)._router.stack.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map(m => m.toUpperCase())
          .join(',');
        console.log(`${methods} ${layer.route.path}`);
      }
    });
  }
}

bootstrap();