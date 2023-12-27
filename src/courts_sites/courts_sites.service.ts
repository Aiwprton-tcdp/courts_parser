import { Injectable } from '@nestjs/common';
import { CreateCourtsSiteDto } from './dto/create-courts_site.dto';
import { UpdateCourtsSiteDto } from './dto/update-courts_site.dto';
import { SeleniumService } from 'src/services/selenium/selenium.service';
import { CourtsSite } from './entities/courts_site.entity';
import { RegionsService } from 'src/regions/regions.service';
import { CourtTypes, Region } from 'src/regions/entities/region.entity';
import { Op } from 'sequelize';

@Injectable()
export class CourtsSitesService {
  constructor(private readonly seleniumService: SeleniumService,
    private readonly regionsService: RegionsService) { }


  private readonly base_url = 'https://sudrf.ru/index.php?id=300';


  create(createCourtsSiteDto: CreateCourtsSiteDto) {
    return 'This action adds a new courtsSite';
  }

  async findAll(court_type?: CourtTypes): Promise<CourtsSite[]> {
    return await CourtsSite.findAll({
      where: {
        id: { [Op.between]: [0, 300] },
        // id: { [Op.between]: [7, 9] },
        link: { [Op.like]: '%.sudrf.ru%' }
      },
      include: [{
        model: Region,
        where: {
          court_type: {
            [Op.in]: [court_type ?? CourtTypes.GENERAL, court_type ?? CourtTypes.MAGISTRATE]
          }
        },
      }]
    });
  }

  async parseByAllRegions(regions: Region[]): Promise<string> {
    const ByCourtType = regions[0].court_type == CourtTypes.MAGISTRATE
      ? '&act=go_ms_search&searchtype=ms&var=true&ms_type=ms'
      : '&act=go_search&searchtype=fs&court_name=&court_type=RS&court_okrug=0';
    const url = `${this.base_url}${ByCourtType}&court_subj=-1`;
    const data = await this.seleniumService.tryToParseCourtSubjectsByRegions(url, regions);

    return await this.saveCourtSubjects(data);
  }

  async parseAllGeneral(): Promise<string> {
    const regions = await this.regionsService.findAll(CourtTypes.GENERAL);
    if (regions.length == 0) {
      return 'Нет данных\n';
    } else {
      const result = await this.parseByAllRegions(regions);
      return result;
    }
  }

  async parseAllMagistrate(): Promise<string> {
    const regions = await this.regionsService.findAll(CourtTypes.MAGISTRATE);
    if (regions.length == 0) {
      return 'Нет данных\n';
    } else {
      const result = await this.parseByAllRegions(regions);
      return result;
    }
  }

  async parseCourtCasesBySubjects(search: string): Promise<any[]> {
    const courtType = CourtTypes.GENERAL;
    const courtSites = await this.findAll(courtType);
    if (courtSites.length == 0) {
      return ['Нет данных'];
    } else {
      const parts = this.splitToNChunks(courtSites, 3);
      console.log('parts.length = ', parts.length, parts[0].length, parts[1].length, parts[2].length);
      
      const threads = parts.map(async (p, key) => await this.seleniumService.tryToParseCourtCasesBySubjects(p, search, key));
      threads.push(this.seleniumService.tryToParseCourtCasesByUniqueSubjects(courtType, search));
      
      return await Promise.allSettled(threads).then(responses => responses);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} courtsSite`;
  }

  update(id: number, updateCourtsSiteDto: UpdateCourtsSiteDto) {
    return `This action updates a #${id} courtsSite`;
  }

  remove(id: number) {
    return `This action removes a #${id} courtsSite`;
  }


  private async saveCourtSubjects(data: any[]): Promise<string> {
    if (data.length == 0) {
      return 'Нет данных\n';
    }

    const count = await CourtsSite.count({
      where: {
        region_id: data[0].region_id
      }
    });

    const created = data.length - count;
    const updated = data.length - created;
    // console.log(count, data.length, created, updated);
    // return 'test';

    if (data.length > count) {
      let counter = 0;

      for await (const d of data) {
        if (counter == count) break;
        CourtsSite.update(new UpdateCourtsSiteDto(d), {
          where: {
            name: d.name,
            link: d.link,
          }
        });
        counter++;
      }

      const forCreate = data.filter((_, key) => key >= count);
      await CourtsSite.bulkCreate(forCreate);
    }

    return `Добавлено: ${created}\nОбновлено: ${updated}\n`;
  }

  private splitToNChunks(array: any[], n: number) {
    if (n < 1) return array;
    let result = [];
    for (let i = n; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
  }
}
