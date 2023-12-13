import { Injectable } from '@nestjs/common';
import { Builder, Browser, ThenableWebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import { CourtTypes, Region } from 'src/regions/entities/region.entity';
import { CreateRegionDto } from 'src/regions/dto/create-region.dto';
import { CourtsSite } from 'src/courts_sites/entities/courts_site.entity';
// import iconv from 'iconv-lite';
const iconv = require('iconv-lite');

@Injectable()
export class SeleniumService {
  constructor() { }


  private readonly base_url = 'https://sudrf.ru/index.php?id=300';


  async tryToParseRegions(): Promise<[CreateRegionDto[], CreateRegionDto[]]> {
    const url_general = this.base_url;
    const url_magistrate = `${this.base_url}&var=true`;
    const driver = this.initDriver();

    /* getting general regions list */
    await driver.get(url_general);
    await driver.sleep(1000);
    const data_general = await driver.getPageSource();

    /* getting magistrate regions list */
    await driver.get(url_magistrate);
    await driver.sleep(1000);
    const data_magistrate = await driver.getPageSource();

    await driver.quit();

    const result_general = this.convertRegions(data_general, true);
    const result_magistrate = this.convertRegions(data_magistrate);

    return [result_general, result_magistrate];
    // return Array.prototype.concat(result_general, result_magistrate);
  }

  async tryToParseCourtSubjectsByRegions(url: string, regions: Region[]): Promise<any[]> {
    const driver = this.initDriver();
    await driver.get(url);
    await driver.sleep(2000);
    const data = await driver.getPageSource();
    await driver.quit();

    const result = regions[0].court_type == CourtTypes.GENERAL
      ? this.convertGeneralCourtSubjects(data)
      : this.convertMagistrateCourtSubjects(data);

    for await (const res of result) {
      const index = regions.findIndex(r => r.name == res.region);
      if (index < 0) continue;
      res.region_id = regions[index].id;
    }

    return result;
  }

  async tryToParseCourtCasesBySubjects(courtsSites: CourtsSite[]): Promise<any[]> {
    const encodedPart = iconv.encode('Юрист для людей', 'win1251');
    const encoded = this.urlEncodeBytes(encodedPart);
    const driver = this.initDriver();
    let allCourtCases = [];

    for await (const cs of courtsSites) {
      const link = cs.link.replace('.', '--').replace('http', 'https');
      const search = `${link}/modules.php?name=sud_delo&srv_num=1&name_op=r&delo_id=1540005&case_type=0&new=0&G1_PARTS__NAMESS=${encoded}&delo_table=g1_case&Submit=%CD%E0%E9%F2%E8`;
      console.log(search);

      const courtCases = this.parseCourtCasesBySubject(driver, search);
      allCourtCases.concat(courtCases);
    }

    await driver.quit();
    return allCourtCases;
  }

  async clickCourtSubjects(driver: ThenableWebDriver): Promise<boolean> {
    const courtSubjects = await driver.findElements({ className: "court-result" });
    if (courtSubjects == null || courtSubjects.length == 0) return false;
    for await (const cs of courtSubjects) {
      await driver.executeScript("arguments[0].click();", cs);
    }
    return true;
  }


  private async parseCourtCasesBySubject(driver: ThenableWebDriver, search: string): Promise<any[]> {
    await driver.get(search);
    await driver.sleep(1000);
    const data = await driver.getPageSource();

    const result = this.convertCourtCases(data);
    console.log(result);

    return result;
  }

  private convertRegions(data: string, court_type_is_default: boolean = false): CreateRegionDto[] {
    const chunk = data.match(/table id=.{0,350}<option value="0"><\/option>.*?<\/select>/s);
    return Array.from(chunk[0].matchAll(
      /<option value="(?<key>\d+)">(?<name>[^<]+)</gm
    )).map(c => {
      const r = new CreateRegionDto();
      r.key = c[1];
      r.name = c[2];
      r.court_type = court_type_is_default ? CourtTypes.GENERAL : CourtTypes.MAGISTRATE;
      return r;
    });
  }

  private convertGeneralCourtSubjects(data: string): any[] {
    return Array.from(data.matchAll(
      /court-result">(?<name>[^(<]+)(?:[^>]+>){5}(?<region>[^<]+).*?"(?<link>http[^"]+)"/gs
    )).map(c => ({
      name: c[1].trim(),
      region: c[2],
      link: c[3],
    }));
  }

  private convertMagistrateCourtSubjects(data: string): any[] {
    const chunk = data.match(/table class="msSearchResultTbl".*ya_all_div/s);
    return !chunk ? [] : Array.from(chunk[0].matchAll(
      /;">(?<name>[^<]+)(?:\s+[^>]+>){3}(?<region>[^<]*)(?:\s*[^>]+>).*?href="(?<link>http[^"]+)/gs
    )).map(c => ({
      name: c[1].trim(),
      region: c[2],
      link: c[3],
    }));
  }

  private convertCourtCases(data: string): any[] {
    return Array.from(data.matchAll(
      /<td title="Для получения справки по делу, нажмите на номер дела"[^>]*><a href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>\s*){4}.*?(?<start_date>[0-9.]+)(?:[^>]+>\s*){2}(?<content>(?:[^<]+<?){3})<(?:[^>]+>\s*){2}(?<judge>[А-яЁё. ]+)(?:[^>]+>\s*){2}(?<solving_data>[0-9.]+)(?:[^>]+>\s*){2}(?<solving>[^<]+)(?:[^>]+>\s*){2}(?<finish_data>[0-9.]+).*?href="(?<acts_link>[^"]+)/gm
    )).map(c => ({
      link: c[1],
      code: c[2],
      start_date: c[3],
      content: c[4].trim(),
      judge: c[5],
      solving_data: c[6],
      solving: c[7].trim(),
      finish_data: c[8],
      acts_link: c[9],
    }));
  }

  private initDriver(): ThenableWebDriver {
    const opt = new Options().addArguments(
      '--headless',
      'start-maximized',
      'disable-infobars',
      '--disable-extensions',
      '--no-sandbox',
      '--disable-application-cache',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    );

    const driver: ThenableWebDriver = new Builder()
      .forBrowser(Browser.FIREFOX)
      .setFirefoxOptions(opt)
      .build();

    return driver;
  }

  private urlEncodeBytes(buf: Buffer): string {
    let encoded = '';
    const len = buf.length;

    for (let i = 0; i < len; i++) {
      const charBuf = Buffer.from('00', 'hex');
      charBuf.writeUInt8(buf[i]);
      const char = charBuf.toString();
      encoded += this.isUrlSafe(char)
        ? char
        : `%${charBuf.toString('hex').toUpperCase()}`;
    }

    return encoded;
  }

  private isUrlSafe(char: string): boolean {
    return /[a-zA-Z0-9\-_~.]+/.test(char)
  }
}
