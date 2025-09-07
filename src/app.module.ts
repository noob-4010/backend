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
      database: 'medcodes', // make sure this DB exists
      entities: [Code],
      autoLoadEntities: true, // loads entities automatically
      synchronize: true, // use only for dev, auto creates tables
    }),
    CodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}