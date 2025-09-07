import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesModule } from './codes/codes.module';
import { Code } from './codes/code.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-d2urp9ogjchc73akqktg-a', // from Render
      port: 5432,
      username: 'backend_db_kz9t_user',       // from Render
      password: 'backend_db_kz9t_user',   // from Render
      database: 'backend_db_kz9t',         // from Render
      entities: [Code],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // required for Render PostgreSQL
      },
    }),
    CodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}