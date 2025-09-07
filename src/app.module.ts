import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';
import { SeedModule } from './seeds/seed.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
    }),

    // TypeORM configuration using environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DB_URL'),
        entities: [Code],
        synchronize: true, // Auto-create tables (dev only)
        ssl: config.get<string>('DB_URL')?.includes('render') ? true : false, // SSL for Render Postgres only
      }),
    }),

    CodesModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}