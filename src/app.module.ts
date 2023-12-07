import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeleniumService } from './services/selenium/selenium.service';
import { CourtsSite } from './courts_sites/entities/courts_site.entity';
import { CourtsSitesService } from './courts_sites/courts_sites.service';
import { CourtsSitesModule } from './courts_sites/courts_sites.module';
import { RegionsModule } from './regions/regions.module';
import { RegionsService } from './regions/regions.service';
import { Region } from './regions/entities/region.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [CourtsSite, Region],
      autoLoadModels: true,
      synchronize: true,
    }),
    CourtsSitesModule,
    RegionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeleniumService,
    CourtsSitesService,
    RegionsService,
  ],
})
export class AppModule { }
