import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { CodesModule } from './codes/codes.module';
import { SeedModule } from './seeds/seed.module';
import { RedisModule } from './redis/redis.module';
import { TranslateModule } from './translate/translate.module';
import { BundleModule } from './bundle/bundle.module';

import { AppController } from './app.controller';
import { Code } from './codes/code.entity';
import { IcdCode } from './codes/icd-code.entity';
import { ConceptMap } from './codes/concept-map.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
          entities: [Code, IcdCode, ConceptMap],
          autoLoadEntities: true,
          synchronize: true,
          ssl: dbUrl?.includes('render') ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    CodesModule,
    SeedModule,
    RedisModule,
    TranslateModule,
    BundleModule,
    HttpModule,

    CacheModule.register({
      ttl: 30,
      max: 100,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}