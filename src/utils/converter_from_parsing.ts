import { CreateRegionDto } from "src/regions/dto/create-region.dto";
import { CourtTypes } from "src/regions/entities/region.entity";


export const regions = (data: string, court_type_is_default: boolean = false): CreateRegionDto[] => {
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

export const generalCourtSubjects = (data: string): any[] => {
  return Array.from(data.matchAll(
    /court-result">(?<name>[^(<]+)(?:[^>]+>){5}(?<region>[^<]+).*?"(?<link>http[^"]+)"/gs
  )).map(c => ({
    name: c[1].trim(),
    region: c[2],
    link: c[3],
  }));
}

export const magistrateCourtSubjects = (data: string): any[] => {
  const chunk = data.match(/table class="msSearchResultTbl".*ya_all_div/s);
  return !chunk ? [] : Array.from(chunk[0].matchAll(
    /;">(?<name>[^<]+)(?:\s+[^>]+>){3}(?<region>[^<]*)(?:\s*[^>]+>).*?href="(?<link>http[^"]+)/gs
  )).map(c => ({
    name: c[1].trim(),
    region: c[2],
    link: c[3],
  }));
}

export const courtCases = (data: string): any[] => {
  return Array.from(data.matchAll(
    /<td title="Для получения справки по делу, нажмите на номер дела"[^>]*><a href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>\s*){4}.*?(?<start_date>[0-9.]+)(?:[^>]+>\s*){2}(?<content>(?:[^<]+<?){3})<(?:[^>]+>\s*){2}(?<judge>[А-яЁё. ]+)(?:[^>]+>\s*){2}(?<solving_data>[0-9.]+)?(?:[^>]+>\s*){2}(?<solving>[^<]+)?(?:[^>]+>\s*){2}(?<finish_data>[0-9.]+)?.*?(?:href="(?<acts_link>[^"]+))?/gm
  )).map(c => ({
    link: c[1],
    code: c[2],
    start_date: c[3],
    content: c[4].trim(),
    judge: c[5],
    solving_status: `${c[7].trim()} (${c[6]})`,
    // solving_data: c[6],
    // solving: c[7].trim(),
    finish_data: c[8],
    acts_link: c[9],
  }));
}

export const courtCasesMoscowGeneral = (data: string): any[] => {
  const chunk = data.match(/class="custom_table".*?<\/table>/s);
  return !chunk ? [] : Array.from(chunk[0].matchAll(
    /<nobr><a target="_blank" class="detailsLink" href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>\s*){9,11}Истец:(?:[^>]+>\s*){1}(?<petitioner>[^<]+)?(?:[^>]+>\s*){3}(?<defendant>[^<]+)?(?:[^>]+>\s*){7}(?<status>[^<]+)(?:[^>]+>\s*){6}(?<judge>[^\s<]+\s?[^\s<]+)?(?:[^>]+>\s*){6}(?<article>[^\s<]+)?(?:[^>]+>\s*){6}(?<act_category>[^<]+)/g
  )).map(c => ({
    link: c[1],
    code: c[2],
    content: `Истец: ${c[3]}\nОтветчик: ${c[4]}`,
    // petitioner: c[3],
    // defendant: c[4],
    solving_status: c[5].trim(),
    judge: c[6],
    // article: c[7],
    // act_category: c[8].trim(),
  }));
}

export const courtCasesChechnyaMagistrate = (data: string): any[] => {
  const chunk = data.match(/class="custom_table".*?<\/table>/s);
  return !chunk ? [] : Array.from(chunk[0].matchAll(
    /<nobr><a target="_blank" class="detailsLink" href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>\s*){9,11}Истец:(?:[^>]+>\s*){1}(?<petitioner>[^<]+)?(?:[^>]+>\s*){3}(?<defendant>[^<]+)?(?:[^>]+>\s*){7}(?<status>[^<]+)(?:[^>]+>\s*){6}(?<judge>[^\s<]+\s?[^\s<]+)?(?:[^>]+>\s*){6}(?<article>[^\s<]+)?(?:[^>]+>\s*){6}(?<act_category>[^<]+)/g
  )).map(c => ({
    link: c[1],
    code: c[2],
    petitioner: c[3],
    defendant: c[4],
    status: c[5].trim(),
    judge: c[6],
    article: c[7],
    act_category: c[8].trim(),
  }));
}
