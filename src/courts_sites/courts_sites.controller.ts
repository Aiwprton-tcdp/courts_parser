import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get('general/court_subj/:id')
  async parseOne(@Param('id') id?: number) {
    const court_subj = id ?? 66;
    const url = `https://sudrf.ru/index.php?id=300&act=go_search&searchtype=fs&court_name=&court_subj=${court_subj}&court_type=RS&court_okrug=0`;
    return await this.seleniumService.tryToParseCourtSubjectsByRegion(url);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourtsSiteDto: UpdateCourtsSiteDto) {
    return this.courtsSitesService.update(+id, updateCourtsSiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courtsSitesService.remove(+id);
  }
}
