import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserData } from './user-data.entity';
import appConfig from './app.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'mycsv_db',
      username: 'postgres',
      password: 'secret',
      entities: [UserData],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
