import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Region } from './entities/region.entity';
import { SeleniumService } from 'src/services/selenium/selenium.service';

@Module({
  imports: [SequelizeModule.forFeature([Region])],
  controllers: [RegionsController],
  providers: [RegionsService, SeleniumService],
})
export class RegionsModule {}
