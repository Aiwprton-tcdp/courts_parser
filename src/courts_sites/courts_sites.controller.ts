import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CourtsSitesService } from './courts_sites.service';
import { CreateCourtsSiteDto } from './dto/create-courts_site.dto';
import { UpdateCourtsSiteDto } from './dto/update-courts_site.dto';
import { SeleniumService } from 'src/services/selenium/selenium.service';

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

  @Get('parse/court_cases?')
  async parseCourtCasesBySubjects(@Query('search') search?: string) {
    console.log('search: ', search);
    // return[];
    const searching = [
      'Ваш юрист',
      // 'Юрист для людей',
      // 'Ерышканов',
    ];
    let results = {};
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() - 1;

    for await (const s of searching) {
      const courtCases = await this.courtsSitesService.parseCourtCasesBySubjects(s);
      const result = courtCases.filter(r => r.status == 'fulfilled').map(r => r.value).flat();

      const filtered = result.filter(r => {
        const date = new Date(r.start_date);
        return !r.start_date && nowYear == r?.code?.match(/\/(\d+)\s?/)[1] || nowYear == date.getFullYear() && date.getMonth() >= nowMonth;
      });
      filtered.map(f => f.link = f.link.replaceAll('amp;', ''));

      results[s] = {
        'all_count': result.length,
        'relevant_count': filtered.length,
        'relevant': filtered,
      };
    }

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
