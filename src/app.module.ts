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
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DB_URL'),
        entities: [Code],
        synchronize: true,
        ssl: config.get<string>('DB_URL')?.includes('render') ? true : false,
      }),
    }),

    CodesModule,
    SeedModule,

    // Makes repository injectable in AppController
    TypeOrmModule.forFeature([Code]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}