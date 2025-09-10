// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';
import { SeedModule } from './seeds/seed.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Use NODE_ENV to decide which env file to load (or none inside Docker)
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DB_URL');

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [Code],
          autoLoadEntities: true,
          synchronize: true, // ⚠️ use migrations in prod, this is fine for dev

          // SSL only for Render or other cloud DBs
          ssl: dbUrl?.includes('render')
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),
    CodesModule,
    SeedModule,
    // Optional: only if you need to inject CodeRepo into AppController
    TypeOrmModule.forFeature([Code]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}