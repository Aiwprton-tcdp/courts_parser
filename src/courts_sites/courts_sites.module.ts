import { Module } from '@nestjs/common';
import { CourtsSitesService } from './courts_sites.service';
import { CourtsSitesController } from './courts_sites.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CourtsSite } from './entities/courts_site.entity';
import { SeleniumService } from 'src/services/selenium/selenium.service';
import { RegionsService } from 'src/regions/regions.service';

@Module({
  imports: [SequelizeModule.forFeature([CourtsSite])],
  controllers: [CourtsSitesController],
  providers: [CourtsSitesService, SeleniumService, RegionsService],
})
export class CourtsSitesModule { }
