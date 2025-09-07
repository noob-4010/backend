import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-d2urp9ogjchc73akqktg-a', // Render internal host
      port: 5432,
      username: 'backend_db_kz9t_user',   // Render username
      password: 'BWp4VnUerAcXNiixNKEYo4HRXXiPz8iX', // Render password
      database: 'backend_db_kz9t',        // Render DB name
      entities: [Code],
      synchronize: true, // auto create tables
      ssl: false,        // internal URL does NOT need SSL
    }),
    CodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}