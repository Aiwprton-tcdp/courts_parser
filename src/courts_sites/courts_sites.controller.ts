import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CourtsSitesService } from './courts_sites.service';
import { CreateCourtsSiteDto } from './dto/create-courts_site.dto';
import { UpdateCourtsSiteDto } from './dto/update-courts_site.dto';
import { SeleniumService } from 'src/services/selenium/selenium.service';
import { CourtTypes } from 'src/regions/entities/region.entity';

@Controller('courts-sites')
export class CourtsSitesController {
  constructor(private readonly courtsSitesService: CourtsSitesService,
    private readonly seleniumService: SeleniumService) { }

  @Post()
  create(@Body() createCourtsSiteDto: CreateCourtsSiteDto) {
    return this.courtsSitesService.create(createCourtsSiteDto);
  }

  @Get()
  findAll() {
    return this.courtsSitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 'this.courtsSitesService.findOne(+id)';
    // return this.courtsSitesService.findOne(+id);
  }

  @Get('parse/all')
  async parseAll() {
    const g = await this.courtsSitesService.parseAllGeneral();
    const m = await this.courtsSitesService.parseAllMagistrate();
    return String.prototype.concat(g, m);
  }

  @Get('parse/general')
  async parseAllGeneral() {
    return await this.courtsSitesService.parseAllGeneral();
  }

  @Get('parse/magistrate')
  async parseAllMagistrate() {
    return await this.courtsSitesService.parseAllMagistrate();
  }

  // http://courts_parser.node.sms19.ru:1288/courts-sites/parse/court_cases/general
  @Get('parse/court_cases/general')
  async parseCourtCasesBySubjects() {
    const searching = [
      'Ваш юрист',
      // 'Юрист для людей',
      // 'Юридическое право',
      // 'Абсолют',
      // 'Финансово-юридический центр',
      // 'Глобус',
    ];
    let results = {};
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() - 1;

    // for await (const s of searching) {
    const courtCases = await this.courtsSitesService.parseCourtCasesBySubjects(searching, CourtTypes.GENERAL);
    const result = courtCases.filter(r => r.status == 'fulfilled').map(r => r.value).flat();

    const filtered = result.filter(r => {
      const date = new Date(r.start_date);
      const date_parts = r.solving_status?.match(/(?<days>\d{2})\.(?<months>\d{2})\.(?<years>\d{4})/);
      if (date_parts == null) return true;
      console.log(r, date_parts);

      const alternative_date = new Date(`${date_parts[2]}/${date_parts[1]}/${date_parts[3]}`); // например, дата назначения судебного заседания

      return !r.start_date && (/*nowYear == r?.code?.match(/\/(\d+)\s?/)[1] || */now < alternative_date) || nowYear == date.getFullYear() && date.getMonth() >= nowMonth;
    });
    filtered.map(f => f.link = f.link.replaceAll('amp;', ''));

    // results[s] = {
    //   'all_count': result.length,
    //   'relevant_count': filtered.length,
    //   'relevant': filtered,
    // };
    // }

    results = {
      'all_count': result.length,
      'relevant_count': filtered.length,
      'relevant': filtered,
    };
    return results;
  }

  @Get('parse/court_cases/magistrate')
  async parseCourtCasesBySubjectsMagistrate() {
    const searching = [
      'Ваш юрист',
      'Юрист для людей',
      'Ерышканов',
      'Сидоров',
    ];
    let results = {};
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() - 1;

    const courtCases = await this.courtsSitesService.parseCourtCasesBySubjects(searching, CourtTypes.MAGISTRATE);
    
    const result = courtCases.filter(r => r.status == 'fulfilled').map(r => r.value).flat();
    const filtered = result.filter(r => {
      const date = new Date(r.start_date);
      const date_parts = r.solving_status?.match(/(?<days>\d{2})\.(?<months>\d{2})\.(?<years>\d{4})/);
      if (date_parts == null) return true;
      console.log(r, date_parts);

      const alternative_date = new Date(`${date_parts[2]}/${date_parts[1]}/${date_parts[3]}`); // например, дата назначения судебного заседания

      return !r.start_date && (/*nowYear == r?.code?.match(/\/(\d+)\s?/)[1] || */now < alternative_date) || nowYear == date.getFullYear() && date.getMonth() >= nowMonth;
    });
    // filtered.map(f => f.link = f.link.replaceAll('amp;', ''));

    results = {
      'all_count': result.length,
      'relevant_count': filtered.length,
      'relevant': filtered,
    };
    return results;
  }

  // @Get('general/:key')
  // async parseByRegionKey(@Param('key') key?: number) {
  //   const region_key = key ?? 66;
  //   return await this.courtsSitesService.parseByRegionKey(region_key);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourtsSiteDto: UpdateCourtsSiteDto) {
    return this.courtsSitesService.update(+id, updateCourtsSiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courtsSitesService.remove(+id);
  }
}
