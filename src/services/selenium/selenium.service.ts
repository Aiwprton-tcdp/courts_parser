import { Injectable } from '@nestjs/common';
import { Builder, Browser, By, ThenableWebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import { Op } from 'sequelize';
import { CourtsSite } from '../../courts_sites/entities/courts_site.entity';
import { CourtTypes } from 'src/regions/entities/region.entity';

@Injectable()
export class SeleniumService {
  constructor() { }

  private readonly base_url = 'https://sudrf.ru/index.php';


  async tryToParseCourtSubjectsByRegion(url: string): Promise<any[]> {
    const driver = this.initDriver();
    await driver.get(url);
    await driver.sleep(1000);
    // await this.clickCourtSubjects(driver);
    // await driver.sleep(2000);
    const data = await driver.getPageSource();

    console.log('data.length: %d', data.length);
    await driver.quit();

    const result = this.convertCourtSubjects(data);
    console.table(result);

    return result;
  }

  async tryToParseRegions(): Promise<[any[], any[]]> {
    const url_general = `${this.base_url}?id=300`;
    const url_magistrate = `${this.base_url}?id=300&var=true`;
    const driver = this.initDriver();

    /* getting general regions list */
    await driver.get(url_general);
    await driver.sleep(1000);
    const data_general = await driver.getPageSource();
    console.log('data.length: %d', data_general.length);

    /* getting magistrate regions list */
    await driver.get(url_magistrate);
    await driver.sleep(1000);

    const data_magistrate = await driver.getPageSource();
    console.log('data.length: %d', data_magistrate.length);

    await driver.quit();

    const result_general = this.convertRegions(data_general, true);
    const result_magistrate = this.convertRegions(data_magistrate);
    console.table(result_general);
    console.table(result_magistrate);

    return [result_general, result_magistrate];
    // return Array.prototype.concat(result_general, result_magistrate);
  }

  async clickCourtSubjects(driver: ThenableWebDriver): Promise<boolean> {
    const courtSubjects = await driver.findElements({ className: "court-result" });
    if (courtSubjects == null || courtSubjects.length == 0) return false;
    for await (const cs of courtSubjects) {
      await driver.executeScript("arguments[0].click();", cs);
    }
    return true;
  }


  private convertRegions(data: string, court_type_is_default: boolean = false): any[] {
    const chunk = data.match(/table id=.{0,350}<option value="0"><\/option>.*?<\/select>/s);
    console.log(chunk.length);
    console.log(chunk[0].length);

    return Array.from(chunk[0].matchAll(
      /<option value="(?<key>\d+)">(?<name>[^<]+)</gm
    )).map(c => ({
      key: c[1],
      name: c[2],
      court_type: court_type_is_default ? CourtTypes.GENERAL : CourtTypes.MAGISTRATE,
    }));
  }

  private convertCourtSubjects(data: string): any[] {
    // const chunk = data.match(/<table id.*?\/table>/g);
    // console.log(chunk.length);
    // console.log(chunk[0].length);

    return Array.from(data.matchAll(
      /<div class="courtInfoCont(?:[^<]+<){2}\/div>\s*<[^>]+>(?<region>[А-яЁё:. -]*)(?:[^>]+>){9} (?<phone>(?:\D*?[0-9]{1})*?)(?: <| \(| ;|, |; )(?:.*?"(?<link>http[^"]+)")/gm
    )).map(c => ({
      region: c[1],
      phone: c[2].replaceAll(/\D/g, ''),
      link: c[3],
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
}
