import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password123',
      database: 'medcodes',
      entities: [Code],
      synchronize: true, // auto-create tables
    }),
    CodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}