import { Injectable } from '@nestjs/common';
import { Builder, Browser, ThenableWebDriver, By, until, Capabilities, Key } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import { CourtTypes, Region } from 'src/regions/entities/region.entity';
import { CreateRegionDto } from 'src/regions/dto/create-region.dto';
import { CourtsSite } from 'src/courts_sites/entities/courts_site.entity';
// import iconv from 'iconv-lite';
import { EncodeString, EncodeStringSplit } from 'src/utils/encoding';
import * as converterFromParsing from 'src/utils/converter_from_parsing';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SeleniumService {
  // constructor(private readonly httpService: HttpService) { }


  private readonly uniqueCasesGeneral = [ // эти сайты (судов общей юрисдикции) теперь требуют капчи
    'igrinskiy.udm',
    'industrialny.hbr',
    'inzhavinsky.tmb',
    'iskitimsky.nsk',
    'kavkazsky.krd',
    'krasnodar-prikubansky',
    'kirsanovsky.tmb',
    'krv.spb',
    'ponyrovsky.krs',
    'abinsk.krd',
    'kirovsky.krs',
    'kirovsky.nsk',
    'sochi-adler.krd',
    'kirovsky.sar',
    'kirovsky.hbr',
    'primorsky.spb',
    'novorossisk-primorsky.krd',
    'primorsko-axtarsky.krd',
    'prionezhsky.kar',
    'pristensky.krs',
    'proletarsky.twr',
    'promyshleny.krs',
    'amursky.hbr',
    'anapa-gor.krd',
    'anapa.krd',
    'priazhsky.kar',
    'klp.spb',
    'anninsky.vrn',
    'pugachevsky.sar',
    'pudozhsky.kar',
    'kolyvansky.nsk',
    'apsheronsk.krd',
    'psh.spb',
    'kominternovsky.vrn',
    'komsomolsky.hbr',
    'konakovsky.twr',
    'arkadaksky.sar',
    'armavir.krd',
    'kondopozhsky.kar',
    'konyshevsky.krs',
    'korenevsky.krs',
    'rameshkovsky.twr',
    'korenovsk.krd',
    'ramonsky.vrn',
    'sud2468.tmb',
    'atkarsky.sar',
    'rzhaksinsky.tmb',
    'rzhevsky.twr',
    'kostomukshsky.kar',
    'kotelnichesky.kir',
    'kotovsky.tmb',
    'rossoshansky.vrn',
    'bazarnj-karabulaksky.sar',
    'rtishevsky.sar',
    'kochenevsky.nsk',
    'balakovsky.sar',
    'balashovsky.sar',
    'krasnoarmeisky.sar',
    'balezinskiy.udm',
    'krasnoarmeisk.krd',
    'barabinsky.nsk',
    'rylsky.krs',
    'kgv.spb',
    'bezhecky.twr',
    'krasnozersky.nsk',
    'belovsky.krs',
    'beloglinsk.krd',
    'sampursky.tmb',
    'sanchursky.kir',
    'belomorsky.kar',
    'saratovsky.sar',
    'belorechensk.krd',
    'berdsky.nsk',
    'krasnokutsky.sar',
    'ksl.spb',
    'bikinsky.hbr',
    'krasnoflotsky.hbr',
    'krn.spb',
    'kropotkin-gor.krd',
    'krilovskoy.krd',
    'krimsk.krd',
    'seversky.krd',
    'kuibyshevsky.nsk',
    'segezhsky.kar',
    'kbs.spb',
    'bogucharsky.vrn',
    'bologovsky.twr',
    'bolotninsky.nsk',
    'semiluksky.vrn',
    'kumensky.kir',
    'bolshesoldatsky.krs',
    'bondarsky.tmb',
    'kupinsky.nsk',
    'kurganinsk.krd',
    'borisoglebsky.vrn',
    'kursky.krs',
    'kurchatovsky.krs',
    'srt.spb',
    'kushevskoy.krd',
    'bruxovecky.krd',
    'labins-gor.krd',
    'labinsk.krd',
    'slavynsk-gor.krd',
    'slavynsky.krd',
    'sochi-lazarevsky.krd',
    'slobodskoy.kir',
    'lahdenpohsky.kar',
    'smolninsky.spb',
    'levoberezhny.vrn',
    'buturlinovsky.vrn',
    'leningradskay.krd',
    'sovetsky.kir',
    'sovetsky.krs',
    'sovetsky.sar',
    'vaninsky.hbr',
    'lnn.spb',
    'vos.spb',
    'sovetsky.vrn',
    'krasnodar-sovetsky.krd',
    'lensud.vrn',
    'sovetsky.nsk',
    'leninskiy.udm',
    'vengerovsky.nsk',
    'leninsky.kir',
    'leninsky.hbr',
    'vbureinsky.hbr',
    'krasnodar-leninsky.krd',
    'verhnekamsky.kir',
    'lensud.krs',
    'sud25.tmb',
    'novorossisk-leninsky.krd',
    'leninsky.nsk',
    's-gavansky.hbr',
    'solnechniy.hbr',
    'solncevsky.krs',
    'leninsky.sar',
    'sud24.tmb',
    'sortavalsky.kar',
    'sud20.tmb',
    'volzhsky.sar',
    'liskinsky.vrn',
    'lihoslavlsky.twr',
    'staricky.twr',
    'starominskay.krd',
    'louhsky.kar',
    'luzsky.kir',
    'starourievsky.tmb',
    'lgovsky.krs',
    'volsky.sar',
    'lazo.hbr',
    'sudzhansky.krs',
    'suzunsky.nsk',
    'suoyarvsky.kar',
    'votkinskiygor.udm',
    'vbr.spb',
    'viselkovsky.krd',
    'vyshnevolocky.twr',
    'vyazemsky.hbr',
    'vyatskopolyansky.kir',
    'gavrilovsky.tmb',
    'gelendjik-gor.krd',
    'glazovskiygor.udm',
    'glushkovsky.krs',
    'gorshechensky.krs',
    'gor-kluch.krd',
    'gribanovsky.vrn',
    'gulkevichi.krd',
    'dzr.spb',
    'dzerzhinsky.nsk',
    'dinskoy.krd',
    'dmitrievsky.krs',
    'dovolensky.nsk',
    'eisk-gor.krd',
    'eisk.krd',
    'ershovsky.sar',
    'zheleznogorsky.krs',
    'zheleznodorozhny.vrn',
    'zheleznodorozhny.nsk',
    'zheleznodorozhny.hbr',
    'zherdevsky.tmb',
    'zavodskoi.sar',
    'zavolzhsky.twr',
    'zavyalovskiy.udm',
    'zaelcovsky.nsk',
    'zapadnodvinsky.twr',
    'zgr.spb',
    'sud4.tmb',
    'zolotuhinsky.krs',
    'zubcovsky.twr',
    'zuevsky.kir',
    'industrialnyy.udm',
    'kalacheevsky.vrn',
    'kalininsk.krd',
    'kalininsky.sar',
    'kalininsky.twr',
    'kln.spb',
    'kalininsky.nsk',
    'kaliazinsky.twr',
    'kambarskiy.udm',
    'kanevskay.krd',
    'kantemirovsky.vrn',
    'karasuksky.nsk',
    'kastorensky.krs',
    'kashinsky.twr',
    'kashirsky.vrn',
    'kezskiy.udm',
    'kemsky.kar',
    'kiznerskiy.udm',
    'kimrsky.twr',
    'kirovochepetcky.kir',
    'liskinsky.vrn',
    'lihoslavlsky.twr',
    'louhsky.kar',
    'luzsky.kir',
    'lgovsky.krs',
    'maksatihinsky.twr',
    'malmizhsky.kir',
    'malopurginskiy.udm',
    'manturovsky.krs',
    'marksovsky.sar',
    'medvezhegorsky.kar',
    'medvensky.krs',
    'michurinskygs.tmb',
    'michurinskyrs.tmb',
    'mozhginskiygor.udm',
    'mordovsky.tmb',
    'morshansky.tmb',
    'moskovsky.twr',
    'msk.spb',
    'mostovskay.krd',
    'moshkovsky.nsk',
    'muezersky.kar',
    'murashinsky.kir',
    'muchkapsky.tmb',
    'nanaysky.hbr',
    'nvs.spb',
    'nelidovsky.twr',
    'nizhnedevicky.vrn',
    'nikiforovsky.tmb',
    'nikolaevsky.hbr',
    'novovoronezhsky.vrn',
    'novovyatsky.kir',
    'novokubansk.krd',
    'novopokrovsky.krd',
    'novosibirsky.nsk',
    'novouzensky.sar',
    'novousmansky.vrn',
    'novohopersky.vrn',
    'nolinsky.kir',
    'oboyansky.krs',
    'obskoy.nsk',
    'oktiabrsky.krs',
    'oktibrsky.spb',
    'oktyabrskiy.udm',
    'oktyabrsky.kir',
    'krasnodar-oktybrsky.krd',
    'novorossisk-oktybrsky.krd',
    'oktiabrsky.nsk',
    'oktyabrsky.sar',
    'sud23.tmb',
    'olonecky.kar',
    'omutninsky.kir',
    'ordynsky.nsk',
    'orichevsky.kir',
    'ostashkovsky.twr',
    'otstrogozhsky.vrn',
    'otradnensky.krd',
    'pavlovsky.krd',
    'pavlovsky.vrn',
    'paninsky.vrn',
    'pervomaisky.tmb',
    'pervomayskiy.udm',
    'pervomaysky.kir',
    'pervomaisky.krd',
    'pervomaisky.nsk',
    'petrovsky.sar',
    'petrovsky.tmb',
    'pgr.spb',
    'pdv.spb',
    'petrozavodsky.kar',
    'pitkiaransky.kar',
    'pichaevsky.tmb',
    'povorinsky.vrn',
    'podosinovsky.kir',
    'staricky.twr',
    'starominskay.krd',
    'starourievsky.tmb',
    'lazo.hbr',
    'sudzhansky.krs',
    'suzunsky.nsk',
    'suoyarvsky.kar',
    'sumsinsky.udm',
    'talovsky.vrn',
    'sud22.tmb',
    'tatarsky.nsk',
    'tatishevsky.sar',
    'tbilissky.krd',
    'temruksky.krd',
    'timashevsky.krd',
    'timsky.krs',
    'tixoreck-gor.krd',
    'tixoreck.krd',
    'toguchinsky.nsk',
    'tokarevsky.tmb',
    'torzhoksky.twr',
    'toropecky.twr',
    'tuapse-gor.krd',
    'tuapse.krd',
    'uvarovsky.tmb',
    'uvinskiy.udm',
    'udomelsky.twr',
    'ulchsky.hbr',
    'umetsky.tmb',
    'uninsky.kir',
    'urzhumsky.kir',
    'uspensky.krd',
    'ustinovskiy.udm',
    'ust-labinsky.krd',
    'fatezhsky.krs',
    'frn.spb',
    'fr.sar',
    'habarovskyr.hbr',
    'homutovsky.krs',
    'sochi-xostinsky.krd',
    'hoholsky.vrn',
    'centralny.vrn',
    'centralny.hbr',
    'centralny.nsk',
    'sochi-centralny.krd',
    'centralny.twr',
    'centralnyr.hbr',
    'chanovsky.nsk',
    'cheremisinovsky.krs',
    'cherepanovsky.nsk',
    'chulymsky.nsk',
    'shabalinsky.kir',
    'sherbinovsky.krd',
    'shigrovsky.krs',
    'engelsky.sar',
    'yukamenskiy.udm',
    'yuryansky.kir',
    'jakutsky.jak',
    'yakshur-bodinskiy.udm',
    'yaransky.kir'
  ];
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
    'mirsud.tatar',
    'stavmirsud.ru',
    'mirsud86',
  ];


  async tryToParseRegions(): Promise<[CreateRegionDto[], CreateRegionDto[]]> {
    const base_url = 'https://sudrf.ru/index.php?id=300';
    const url_general = base_url;
    const url_magistrate = `${base_url}&var=true`;
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

  async tryToParseCourtCasesBySubjects(courtsSites: CourtsSite[], searchText: string[], key: number, courtType: CourtTypes): Promise<any[]> {
    const encoded = searchText.map(s => EncodeString(s));
    const driver = this.initDriver();
    let allCourtCases = [];

    for await (const cs of courtsSites) {
      if (this.uniqueCases.filter(uc => cs.link.includes(uc)).length > 0) {
        console.log(key, ') uniqueCases');
        continue;
      } else if (cs.link.includes('inzenskiy.uln')) {
        // https://inzenskiy--uln.sudrf.ru/modules.php?name_op=r&name=sud_delo&srv_num=1&_deloId=&case__case_type=&_new=&case__vnkod=73RS0008&case__num_build=1&case__case_numberss=&part__namess=%C2%E0%F8+%FE%F0%E8%F1%F2&case__entry_date1d=&case__entry_date2d=&process-type=%CF%EE%E8%F1%EA+%EF%EE+%E2%F1%E5%EC+%E2%E8%E4%E0%EC+%E4%E5%EB
        console.log(key, ') Инзенский районный суд Ульяновской обл. --- другой url');
        continue;
      } else if (this.uniqueCasesGeneral.filter(uc => cs.link.includes(uc)).length > 0) {
        console.log(key, ') uniqueCasesGeneral');
        continue;
      }

      const domain = courtType == CourtTypes.GENERAL ? cs.link.replace('.', '--').replace('http:', 'https:') : cs.link;
      console.log('domain', domain);

      for await (const en of encoded) {
        const search = courtType == CourtTypes.GENERAL
          ? `${domain}/modules.php?name=sud_delo&srv_num=1&name_op=r&delo_id=1540005&case_type=0&new=0&G1_PARTS__NAMESS=${en}&delo_table=g1_case&Submit=%CD%E0%E9%F2%E8`
          : `${domain}/modules.php?name=sud_delo&G1_PARTS__PARTS_TYPE=%D0%9E%D1%82%D0%B2%D0%B5%D1%82%D1%87%D0%B8%D0%BA&G1_PARTS__NAMESS=${en}&delo_id=1540005&op=sf`;
        // http://1ord.svd.msudrf.ru/modules.php?name=sud_delo&G1_PARTS__PARTS_TYPE=%D0%9E%D1%82%D0%B2%D0%B5%D1%82%D1%87%D0%B8%D0%BA&G1_PARTS__NAMESS=%D0%AE%D1%80%D0%B8%D1%81%D1%82+%D0%B4%D0%BB%D1%8F+%D0%BB%D1%8E%D0%B4%D0%B5%D0%B9&delo_id=1540005&op=sf

        const courtCases = await this.parseCourtCasesBySubject(driver, search, domain);
        console.log(courtCases);
        allCourtCases.push(...courtCases);
        console.log(`${key}) ${allCourtCases.length} (+${courtCases.length})`, search);
      }
    }

    await driver.quit();
    return allCourtCases;
  }

  async tryToParseCourtCasesByUniqueSubjects(courtType: CourtTypes, search: string[]): Promise<any[]> {
    const driver = this.initDriver();

    if (courtType == CourtTypes.GENERAL) {
      return await this.parseCourtCasesByUniqueGeneralSubjects(driver, search);
    } else {
      return await this.parseCourtCasesByUniqueMagistrateSubjects(driver, search);
    }
  }

  async clickCourtSubjects(driver: ThenableWebDriver): Promise<boolean> {
    const courtSubjects = await driver.findElements({ className: 'court-result' });
    if (courtSubjects == null || courtSubjects.length == 0) return false;
    for await (const cs of courtSubjects) {
      await driver.executeScript('arguments[0].click();', cs);
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
      .withCapabilities(Capabilities.firefox().set('acceptInsecureCerts', true))
      .build();

    return driver;
  }

  private async parseCourtCasesBySubject(driver: ThenableWebDriver, search: string, domain: string): Promise<any[]> {
    await driver.get(search);
    await Promise.race([
      driver.wait(until.titleContains('суд'), 1000),
      driver.wait(until.titleContains('СУД'), 1000),
      driver.wait(until.titleContains('Суд'), 1000),
    ]);
    driver.sleep(1000);


    // Для сайтов мировых судей
    /*
        const imgs = await driver.findElements(By.css('img'));
        if (imgs == null || imgs.length < 3) {
          console.log('imgs == null || imgs.length < 3');
        }
        console.log('imgs.length', imgs.length);
        const img = imgs[1]; // 'arguments[0].click();'
        const base64 = await img.takeScreenshot();
        console.log('base64', base64);
        console.log('base64.length', base64.length);
    
        const captcha = await this.captha(base64);
        console.log('captcha');
        console.log(captcha);
    
        return [captcha];
    */


    const data = await driver.getPageSource();
    // if (data.includes('Неверно указан проверочный код с картинки.')) {
    //   return [{
    //     link: domain,
    //     code: domain.match(/\/\/(.*?)\.sudrf.ru/)[1],
    //     start_date: null,
    //     content: 'Неверно указан проверочный код с картинки.',
    //   }];
    // }
    // return [];
    return converterFromParsing.courtCases(data, domain);
  }

  /**
   * Парсинг сайтов судов общей юрисдикции, отличных от шаблонных
   * ~ 2 seconds per 1 search string
   */
  private async parseCourtCasesByUniqueGeneralSubjects(driver: ThenableWebDriver, searchText: string[]): Promise<any[]> {
    let allCourtCases = [];

    const moscow = await this.parseFromGMoscow(driver, searchText);
    console.log('moscow', moscow);
    allCourtCases.push(...moscow);

    await driver.quit();
    return allCourtCases;
  }

  private async parseFromGMoscow(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    let results = [];
    const domain = 'https://mos-gorsud.ru';
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+', 'utf8'));

    for await (const s of encodedSearch) {
      await driver.get(`${domain}/search?participant=${s}&formType=shortForm&page=1`);
      await driver.wait(until.titleContains('суд'), 1000);

      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesMoscowGeneral(data, domain);
      results.push(...courtCases);
    }

    return results;
  }
  /* Парсинг сайтов судов общей юрисдикции, отличных от шаблонных */

  /**
   * Парсинг сайтов мировых судей, отличных от шаблонных
   * < 3.5 minutes per 1 search string
   */
  private async parseCourtCasesByUniqueMagistrateSubjects(driver: ThenableWebDriver, searchText: string[]): Promise<any[]> {
    let allCourtCases = [];

    const mordovia = await this.parseFromMordovia(searchText);
    console.log('mordovia', mordovia.length);
    allCourtCases.push(...mordovia);

    const tatarstan = await this.parseFromTatarstan(driver, searchText);
    console.log('tatarstan', tatarstan.length);
    allCourtCases.push(...tatarstan);

    const chechnya = await this.parseFromChechnya(driver, searchText);
    console.log('chechnya', chechnya.length);
    allCourtCases.push(...chechnya);

    const krasnoyarsk = await this.parseFromKrasnoyarsk(searchText);
    console.log('krasnoyarsk', krasnoyarsk.length);
    allCourtCases.push(...krasnoyarsk);

    const stavropol = await this.parseFromStavropol(driver, searchText);
    console.log('stavropol', stavropol.length);
    allCourtCases.push(...stavropol);

    const orenburg = await this.parseFromOrenburg(driver, searchText);
    console.log('orenburg', orenburg.length);
    allCourtCases.push(...orenburg);

    const pskov = await this.parseFromPskov(driver, searchText);
    console.log('pskov', pskov.length);
    allCourtCases.push(...pskov);

    const moscow = await this.parseFromMoscow(driver, searchText);
    console.log('moscow', moscow.length);
    allCourtCases.push(...moscow);

    const spb = await this.parseFromSPb(searchText);
    console.log('spb', spb.length);
    allCourtCases.push(...spb);

    const hmao = await this.parseFromHMAO(driver, searchText);
    console.log('hmao', hmao.length);
    allCourtCases.push(...hmao);

    const crimea = await this.parseFromCrimea(driver, searchText);
    console.log('crimea', crimea.length);
    allCourtCases.push(...crimea);

    const sevastopol = await this.parseFromSevastopol(driver, searchText);
    console.log('sevastopol', sevastopol.length);
    allCourtCases.push(...sevastopol);

    await driver.quit();
    return allCourtCases;
  }

  private async parseFromMordovia(search: string[]): Promise<any[]> {
    let results = [];
    const domain = 'https://mirsud.e-mordovia.ru/';
    const base = `${domain}api/JudicialDeal?IdTypeProd=20&IdSubTypeProd=12&Page=1&Fio=`;
    const encodedSearch = search.map(s => EncodeString(s, 'utf8'));

    for (let i = 1; i < 46; i++) {
      if (i == 33) continue;
      if (i % 10 == 0) await new Promise(resolve => setTimeout(resolve, 500));

      for await (const s of encodedSearch) {
        await new HttpService().axiosRef.get(base + s, {
          headers: {
            'Host': 'mirsud.e-mordovia.ru',
            'Referer': `${domain}Home/Records/${i}`,
            'Content-Type': 'application/json',
          }
        }).then(data => {
          if (data.data?.Count == 0) return;

          const list: any[] = data.data.List;
          results.push(...list.map(l => ({
            link: `${domain}Home/Document/?idRaion=${i}&idDeal=${l.Id}`,
            code: l.Number,
            start_date: l.Date,
            content: `Дата: ${l.Date}\nСудья: ${l.Judge}\nРешение: ${l.Result}`,
          })));
        }).catch(e => console.log(i, e.code));
      }
    }

    return results;
  }

  private async parseFromTatarstan(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    return await this.parseTemplate1(driver, search, 'mirsud.tatarstan.ru');
  }

  private async parseFromChechnya(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    return await this.parseTemplate1(driver, search, 'mirsud-chr.ru');
  }

  //TODO по минуте на каждый запрос
  private async parseFromKrasnoyarsk(search: string[]): Promise<any[]> {
    let results = [];
    const base = 'https://mirsud24.ru';
    const url = `${base}/start/informatsiya-po-sudebnym-delam`;
    const currentYear = new Date().getFullYear();

    for await (const s of search) {
      await new HttpService().axiosRef.post(`${url}/search.php`, {
        sprsType: 'jp',
        sprs: s,
        numberingyear: currentYear,
        uid: 'NO',
      }, {
        headers: {
          'Origin': base,
          'Referer': url,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        }
      }).then(data => {
        const courtCases = converterFromParsing.courtCasesKrasnoyarskMagistrate(data.data, url);
        results.push(...courtCases);
      }).catch(e => console.log(e));
    }

    return results;
  }

  private async parseFromStavropol(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    return this.parseTemplate2(driver, search, 'https://stavmirsud.ru', 9);
  }

  private async parseFromOrenburg(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    let results = [];
    const url = 'https://kodms.ru/case';

    await driver.get(url);
    await driver.wait(until.titleIs('Поиск дел'), 1000);

    const inputs = await driver.findElements({ tagName: 'input' });
    if (inputs == null || inputs.length < 3) {
      console.log('parseFromOrenburg: no inputs');
      return results;
    }
    const FIO = inputs[2];

    for await (const s of search) {
      await FIO.clear();
      await driver.actions()
        .click(FIO)
        .sendKeys(s)
        .sendKeys(Key.ENTER)
        .perform();
      await driver.sleep(1000);

      let data = await driver.getPageSource();
      while (data.includes('Поиск...')) {
        await driver.sleep(1000);
        data = await driver.getPageSource();
      }

      const courtCases = converterFromParsing.courtCasesOrenburgMagistrate(data, url, s);
      results.push(...courtCases);
    }

    return results;
  }

  private async parseFromPskov(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    let results = [];
    const domain = 'https://mirsud.pskov.ru';
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+'));

    for await (const s of encodedSearch) {
      await driver.get(`${domain}/courtsst/activity/decisionas/?sf12=${s}&ms=0`);
      await driver.wait(until.titleContains('дела'), 1000);

      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesPskovMagistrate(data, domain);
      results.push(...courtCases);
    }

    return results;
  }

  //TODO может грузиться очень долго, дольше минуты
  private async parseFromMoscow(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    let results = [];
    const base = 'https://mos-sud.ru';
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+', 'utf8'));

    for await (const s of encodedSearch) {
      const url = `${base}/search?participant=${s}&formType=shortForm`;
      await driver.get(url);
      try {
        await driver.wait(until.titleContains('суд'), 1000);
      } catch (error) {
        console.log(`Сайт ${url} не грузится`);
        continue;
      }

      await driver.sleep(10000);
      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesMoscowMagistrate(data, base);
      results.push(...courtCases);
    }

    return results;
  }

  private async parseFromSPb(search: string[]): Promise<any[]> {
    let results = [];
    const domain = 'https://mirsud.spb.ru';
    const base = `${domain}/cases/`;
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+', 'utf8'));
    const currentYear = new Date().getFullYear();

    for await (const s of encodedSearch) {
      const search_id_url = `${base}api/search/?adm_person_type=all&civil_person_type=all&criminal_person_type=all&date_from=08.01.${currentYear - 1}&date_to=08.01.${currentYear}&full_name=${s}&page=1&type=public`;
      const search_id = await new HttpService().axiosRef.get(search_id_url);
      const id = search_id.data?.id;
      if (id == null) continue;

      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const search_url = `${base}api/results/?id=${id}`;
        const search = await new HttpService().axiosRef.get(search_url);
        const data = search.data;

        const result: any[] = data?.result?.data;
        if (data?.finished != true && (result == null || data?.result?.count == '0')) continue;

        const res = result.map(r => ({
          link: domain + r.url,
          code: r.id,
          start_date: r.date,
          content: `Истец: ${r.claimants}, ответчик: ${r.respondents}, стадия: ${r.status}`,
        }));
        results.push(...res);

        if (data?.finished == true) break;
      }
    }

    return results;
  }

  private async parseFromHMAO(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    let results = [];
    const domain = 'http://mirsud86.ru';
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+'));
    const currentYear = new Date().getFullYear();

    for await (const s of encodedSearch) {
      const url = `${domain}/activity/decisionkas/?year=${currentYear}&sf4=${s}`;
      await driver.get(url);
      await driver.wait(until.titleContains('дела'), 1000);
      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesHMAOMagistrate(data, domain);
      results.push(...courtCases);
    }

    return results;
  }

  private async parseFromCrimea(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    return this.parseTemplate2(driver, search, 'http://mirsud82.rk.gov.ru', 14);
  }

  private async parseFromSevastopol(driver: ThenableWebDriver, search: string[]): Promise<any[]> {
    return this.parseTemplate2(driver, search, 'https://mirsud.sev.gov.ru', 14);
  }

  private async parseTemplate1(driver: ThenableWebDriver, search: string[], domain: string): Promise<any[]> {
    let results = [];
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+', 'utf8'));

    for await (const s of encodedSearch) {
      await driver.get(`https://${domain}/search?participant=${s}`);
      await driver.wait(until.titleContains('суд'), 5000);

      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesTatarstanMagistrate(data, domain);
      results.push(...courtCases);
    }

    return results;
  }

  private async parseTemplate2(driver: ThenableWebDriver, search: string[], domain: string, search_index: number): Promise<any[]> {
    let results = [];
    const encodedSearch = search.map(s => EncodeStringSplit(s, '+'));
    const currentYear = new Date().getFullYear();
    const decisionas_mistake = domain.includes('sev.gov') ? 'decisionas' : 'decisionkas';

    for await (const s of encodedSearch) {
      const url = `${domain}/officework/${decisionas_mistake}/?year=${currentYear}&sf${search_index}=${s}`;
      await driver.get(url);
      await driver.wait(until.titleContains('::'), 1000);
      // await driver.wait(until.titleContains(domain.replace('https://', '')), 1000);

      const data = await driver.getPageSource();
      const courtCases = converterFromParsing.courtCasesStavropolMagistrate(data, domain);
      results.push(...courtCases);
    }

    return results;
  }
  /* Парсинг сайтов мировых судей, отличных от шаблонных */

  private async captha(base64: string): Promise<any> {
    // https://2captcha.com/software/2captcha-ts
    // https://8500.ru/base64file/

    const captcha = await new HttpService().axiosRef.post('https://api.2captcha.com/createTask', {
      // const captcha = this.httpService.post('https://api.2captcha.com/createTask', {
      clientKey: process.env.CAPTCHA_TOKEN,
      task: {
        type: 'ImageToTextTask',
        body: base64,
        phrase: false,
        case: false,
        numeric: 4,
        math: false,
        minLength: 4,
        maxLength: 8,
        comment: 'Введите текст, который вы видите на изображении'
      },
      // softId: '3898',
      languagePool: 'rn'
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return captcha.data;
  }
}
