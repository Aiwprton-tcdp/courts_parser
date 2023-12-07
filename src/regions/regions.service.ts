import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { SeleniumService } from 'src/services/selenium/selenium.service';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(private readonly seleniumService: SeleniumService) { }

  create(createRegionDto: CreateRegionDto) {
    return 'This action adds a new region';
  }

  findAll() {
    return `This action returns all regions`;
  }

  async parseRegions() {
    const [GENERAL, MAGISTRATE] = await this.seleniumService.tryToParseRegions();
    const res1 = await this.saveRegions(GENERAL);
    const res2 = await this.saveRegions(MAGISTRATE);

    return `${res1}\n${res2}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} region`;
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
    const updated = count;

    if (data.length > count) {
      let counter = 0;
      // let forUpdate = [];
      for await (const d of data) {
        if (counter == count) break;
        Region.update(d, {
          where: {
            key: d.key,
            court_type: d.court_type,
          }
        });
        // forUpdate.push(d);
        counter++;
        // update
      }
      // console.log('saveRegions');
      // console.table(forUpdate);
      const forCreate = data.filter((d, key) => key >= count);
      // console.table(forCreate);

      await Region.bulkCreate(forCreate);
    }

    return `Добавлено: ${created}\nОбновлено: ${updated}`;
  }
}
