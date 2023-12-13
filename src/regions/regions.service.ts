import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { SeleniumService } from 'src/services/selenium/selenium.service';
import { CourtTypes, Region } from './entities/region.entity';
import { Op } from 'sequelize';

@Injectable()
export class RegionsService {
  constructor(private readonly seleniumService: SeleniumService) { }

  create(createRegionDto: CreateRegionDto) {
    return 'This action adds a new region';
  }

  async findAll(court_type?: CourtTypes): Promise<Region[]> {
    return await Region.findAll({
      where: {
        court_type: {
          [Op.in]: [court_type ?? CourtTypes.GENERAL, court_type ?? CourtTypes.MAGISTRATE]
        }
      }
    });
  }

  async parseRegions() {
    const [GENERAL, MAGISTRATE] = await this.seleniumService.tryToParseRegions();
    const res1 = await this.saveRegions(GENERAL);
    const res2 = await this.saveRegions(MAGISTRATE);

    return `Федеральные суды общей юрисдикции:\n${res1}\nУчастки мировых судей:\n${res2}`;
  }

  async findOne(id: number): Promise<Region> {
    return await Region.findByPk(id);
  }

  async findByKey(key: number): Promise<Region> {
    return await Region.findOne({
      where: { key }
    });
  }

  update(id: number, updateRegionDto: UpdateRegionDto) {
    return `This action updates a #${id} region`;
  }

  remove(id: number) {
    return `This action removes a #${id} region`;
  }


  private async saveRegions(data: any[]): Promise<string> {
    const count = await Region.count({
      where: {
        court_type: data[0].court_type
      }
    });

    const created = data.length - count;
    const updated = data.length - created;

    if (data.length > count) {
      let counter = 0;

      for await (const d of data) {
        if (counter == count) break;
        Region.update(new UpdateRegionDto(d), {
          where: {
            key: d.key,
            court_type: d.court_type,
          }
        });
        counter++;
      }

      const forCreate = data.filter((_, key) => key >= count);
      await Region.bulkCreate(forCreate);
    }

    return `Добавлено: ${created}\nОбновлено: ${updated}\n`;
  }
}
