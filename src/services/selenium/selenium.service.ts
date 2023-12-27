import { Injectable } from '@nestjs/common';
import { Builder, Browser, ThenableWebDriver, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import { CourtTypes, Region } from 'src/regions/entities/region.entity';
import { CreateRegionDto } from 'src/regions/dto/create-region.dto';
import { CourtsSite } from 'src/courts_sites/entities/courts_site.entity';
// import iconv from 'iconv-lite';
import { EncodeString, EncodeStringSplit } from 'src/utils/encoding';
import * as converterFromParsing from 'src/utils/converter_from_parsing';

@Injectable()
export class SeleniumService {
  constructor() { }


  private readonly baseUrl = 'https://sudrf.ru/index.php?id=300';
  private readonly uniqueCases = [
    'mos-gorsud',
    'mirsud-chr',
    'mirsud.spb',
    'mirsud.sev.gov',
    'mirsud.lipetsk',
    'kodms.ru',
    'mirsud.pskov.ru',
    'mirsud82.rk.gov',
    'mirsud.e-mordovia',
    'mirsud.tatarstan',
    'stavmirsud.ru',
    'mirsud86',
  ];


  async tryToParseRegions(): Promise<[CreateRegionDto[], CreateRegionDto[]]> {
    const url_general = this.baseUrl;
    const url_magistrate = `${this.baseUrl}&var=true`;
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

    const result_general = converterFromParsing.regions(data_general, true);
    const result_magistrate = converterFromParsing.regions(data_magistrate);

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
      ? converterFromParsing.generalCourtSubjects(data)
      : converterFromParsing.magistrateCourtSubjects(data);

    for await (const res of result) {
      const index = regions.findIndex(r => r.name == res.region);
      if (index < 0) continue;
      res.region_id = regions[index].id;
    }

    return result;
  }

  async tryToParseCourtCasesBySubjects(courtsSites: CourtsSite[], search: string, key: number): Promise<any[]> {
    const searchText = search;
    const encoded = EncodeString(searchText);
    const driver = this.initDriver();
    let allCourtCases = [];

    for await (const cs of courtsSites) {
      if (this.uniqueCases.filter(uc => cs.link.includes(uc)).length > 0) {
        console.log(key, ') uniqueCases');
        continue;
      } else if (cs.link.includes('krasnodar-prikubansky')) {
        console.log(key, ') Прикубанский районный суд г. Краснодара --- требует капчу в фильтрах');
        continue;
      } else if (cs.link.includes('kirsanovsky.tmb')) {
        console.log(key, ') Кирсановский районный суд Тамбовской области --- требует капчу в фильтрах');
        continue;
      }

      const link = cs.link.replace('.', '--').replace('http:', 'https:');
      const search = `${link}/modules.php?name=sud_delo&srv_num=1&name_op=r&delo_id=1540005&case_type=0&new=0&G1_PARTS__NAMESS=${encoded}&delo_table=g1_case&Submit=%CD%E0%E9%F2%E8`;
      const courtCases = await this.parseCourtCasesBySubject(driver, search);
      courtCases.forEach(c => c.link = link + c.link);
      // courtCases.forEach(c => c.link = link + c.link.replaceAll('amp;', ''));

      allCourtCases.push(...courtCases);
      console.log(key, ') ', courtCases.length, allCourtCases.length, search);
    }

    await driver.quit();
    return allCourtCases;
  }

  async tryToParseCourtCasesByUniqueSubjects(courtType: CourtTypes, search: string): Promise<any[]> {
    const driver = this.initDriver();
    const searchText = search;
    // const searchText = 'Ваш юрист';

    if (courtType == CourtTypes.GENERAL) {
      return await this.parseCourtCasesByUniqueGeneralSubjects(driver, searchText);
    } else {
      return await this.parseCourtCasesByUniqueMagistrateSubjects(driver, searchText);
    }
  }

  async clickCourtSubjects(driver: ThenableWebDriver): Promise<boolean> {
    const courtSubjects = await driver.findElements({ className: "court-result" });
    if (courtSubjects == null || courtSubjects.length == 0) return false;
    for await (const cs of courtSubjects) {
      await driver.executeScript("arguments[0].click();", cs);
    }
    return true;
  }

  async copyImageForCaptureSolving(driver: ThenableWebDriver): Promise<boolean> {
    const images = await driver.findElements(By.css('img'));
    if (images == null || images.length < 2) return false;
    const img = await driver.executeScript("arguments[0].execCommand('copy');", images[1]);
    console.log(img);

    return true;
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

  private async parseCourtCasesBySubject(driver: ThenableWebDriver, search: string): Promise<any[]> {
    await driver.get(search);
    // console.log('data.length = ', search);
    await Promise.race([
      driver.wait(until.titleContains('суд'), 1000),
      driver.wait(until.titleContains('СУД'), 1000),
      driver.wait(until.titleContains('Суд'), 1000),
    ]);
    // try { await driver.wait(until.titleContains('суд'), 1000); } catch (error) {}
    // try { await driver.wait(until.titleContains('СУД'), 1000); } catch (error) {}
    // try { await driver.wait(until.titleContains('Суд'), 1000); } catch (error) {}
    // await driver.wait(until.titleContains('суд') || until.titleContains('СУД') || until.titleContains('Суд'), 1000);
    const data = await driver.getPageSource();
    // console.log('data.length = ', data.length);
    return converterFromParsing.courtCases(data);
  }

  private async parseCourtCasesByUniqueGeneralSubjects(driver: ThenableWebDriver, searchText: string): Promise<any[]> {
    let allCourtCases = [];
    const moscow = await this.parseCourtCasesFromMoscow(driver, searchText);
    console.log('moscow');
    console.log(moscow);
    allCourtCases.push(...moscow);

    await driver.quit();
    return allCourtCases;
  }

  private async parseCourtCasesByUniqueMagistrateSubjects(driver: ThenableWebDriver, searchText: string): Promise<any[]> {
    let allCourtCases = [];

    const chechnya = await this.parseCourtCasesFromChechnya(driver, searchText);
    console.log('chechnya');
    console.log(chechnya);
    allCourtCases.push(...chechnya);

    await driver.quit();
    return allCourtCases;
  }

  private async parseCourtCasesFromMoscow(driver: ThenableWebDriver, search: string): Promise<any[]> {
    const searchText = EncodeStringSplit(search, '+', 'utf8');
    const base = 'https://mos-gorsud.ru';
    const url = `${base}/search?participant=${searchText}&formType=fullForm&page=1`;

    await driver.get(url);
    await driver.wait(until.titleContains('суд'), 800);
    const data = await driver.getPageSource();

    const courtCases = converterFromParsing.courtCasesMoscowGeneral(data);
    courtCases.forEach(c => c.link = base + c.link);

    return courtCases;
  }

  private async parseCourtCasesFromChechnya(driver: ThenableWebDriver, search: string): Promise<any[]> {
    return [];

    const searchText = EncodeStringSplit(search, '+', 'utf8');
    const url = `https://mos-gorsud.ru/search?participant=${searchText}&formType=fullForm&page=1`;

    await driver.get(url);
    await driver.wait(until.titleContains('суд'), 800);
    const data = await driver.getPageSource();
    return converterFromParsing.courtCasesChechnyaMagistrate(data);
  }
}
