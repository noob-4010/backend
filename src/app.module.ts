// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';
import { IcdCode } from './codes/icd-code.entity'; // ✅ new entity
import { ConceptMap } from './codes/concept-map.entity'; // ✅ new entity
import { SeedModule } from './seeds/seed.module';
import { AppController } from './app.controller';
import { RedisModule } from './redis/redis.module';
import { TranslateModule } from './translate/translate.module';

@Module({
  imports: [
    TranslateModule,
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
          entities: [Code, IcdCode, ConceptMap], // ✅ register all entities
          autoLoadEntities: true,
          synchronize: true, // ⚠️ use migrations in prod
          ssl: dbUrl?.includes('render') ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    CodesModule,
    SeedModule,
    RedisModule,
    TypeOrmModule.forFeature([Code, IcdCode, ConceptMap]), // ✅ include them here too
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}