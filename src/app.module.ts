import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://backend_db_kz9t_user:BWp4VnUerAcXNiixNKEYo4HRXXiPz8iX@dpg-d2urp9ogjchc73akqktg-a/backend_db_kz9t', // internal URL
      entities: [Code],
      synchronize: true, // auto-create tables
      ssl: false,        // internal URL does NOT require SSL
    }),
    CodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}