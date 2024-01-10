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

export const courtCases = (data: string, domain: string): any[] => {
  return Array.from(data.matchAll(
    /<td title="Для получения справки по делу, нажмите на номер дела"[^>]*><a href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>\s*){4}.*?(?<date>[0-9.]+)(?:[^>]+>\s*){2}(?<content>(?:[^<]+(?:<br>)?)+)(?:[^>]+>\s*){2}(?<judge>[А-яЁё. ]+)(?:[^>]+>\s*){2}(?<solving_date>[0-9.]+)(?:[^>]+>\s*){2}(?<solving>[^<]+)/g
  )).map(c => ({
    link: domain + c[1].replaceAll('amp;', ''),
    code: c[2],
    start_date: c[3],
    content: `${c[4].trim()}\nСудья: ${c[5]}\nСтадия: ${c[7].trim()} (${c[6]})`,
  }));
}

export const courtCasesMoscowGeneral = (data: string, domain: string): any[] => {
  const chunk = data.match(/class="custom_table".*?<\/table>/s);
  return !chunk ? [] : Array.from(chunk[0].matchAll(
    /<nobr><a target="_blank" class="detailsLink" href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>){11,13}Истец:(?:[^>]+>\s*){1}(?<petitioner>[^<]+)?(?:[^>]+>\s*){3}(?<defendant>[^<]+)?(?:[^>]+>\s*){7}(?<status>[^0-9]+)(?<date>(?:[0-9.]{10})|)(?:[^>]+>\s*){6}(?<judge>[^\s<]+\s?[^\s<]+)?(?:[^>]+>\s*){12}(?<act_category>[^<]+)/g
  )).map(c => ({
    link: domain + c[1],
    code: c[2],
    start_date: c[6],
    content: `Истец: ${c[3]}\nОтветчик: ${c[4]}\nСудья: ${c[7]}\nСтатья: ${c[8].trim()}, решение: ${c[5].trim()} ${c[6]}`,
  }));
}

export const courtCasesTatarstanMagistrate = (data: string, domain: string): any[] => {
  return Array.from(data.matchAll(
    /<nobr><a target="_blank" class="detailsLink" href="(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>){2}(?:\s+(?:|∼|~)\s+\(?<nobr>[^>]+>\)?)?(?:[^>]+>){3}(?:Привлекаемое лицо(?:[^>]+>){2}|Истец(?:[^>]+>){6})(?<petitioner>[А-яЁё.,"]+ [А-яЁё.," ]+)(?:[^>]+>){4}\s*(?<status>[^<0-9]+)(?<date>(?:[0-9.]{10})|)/g
  )).map(c => ({
    link: `https://${domain}${c[1]}`,
    code: c[2],
    start_date: c[5],
    content: `Ответчик: ${c[3]}\nРешение: ${c[4].slice(0, -2).trim()}`,
  }));
}

export const courtCasesKrasnoyarskMagistrate = (data: string, url: string): any[] => {
  return Array.from(data.matchAll(
    /<td>(?<date>[0-9.]{10})(?:[^>]+>){3}(?<code>[^<]+).*?href='?"?(?<link>[^'"]+).*?<\/td>(?:[^>]+>){3}(?<content>[^<]+)(?:[^>]+>){2}(?<participants>[^<]+)/gs
  )).map(c => ({
    start_date: c[1],
    code: c[2],
    link: `${url}/${c[3]}`,
    content: `${c[4]}\nУчастники: ${c[5]}`,
  }));
}

export const courtCasesStavropolMagistrate = (data: string, domain: string): any[] => {
  return Array.from(data.matchAll(
    /<td[^>]*>(?<code>[0-9А-яЁё-]+\/\d{1,4}\/\d{4})<\/td>\s*[^>]+>(?<date>(?:\d{2}-){2}\d{4})(?:[^>]+>\s*){4}(?<judge>[^<]+)(?:[^>]+>){2}(?<status>[^<]+)(?:[^>]+>){2}(?<defendant>[^<]+)(?:[^>]+>){2,6}<a href="?(?<link>[^">]+)"?>/g
  )).map(c => ({
    code: c[1],
    start_date: c[2].replaceAll('-', '.'),
    content: `Ответчик: ${c[5]}, судья: ${c[3]}\nРешение: ${c[4]}`,
    link: domain + c[6],
  }));
}

export const courtCasesOrenburgMagistrate = (data: string, domain: string, defendant: string): any[] => {
  const ddd = (d: string): string => {
    const s = d.split('/');
    return `${s[1]}.${s[0]}.${s[2]}`;
  };

  return Array.from(data.matchAll(
    /<span>Дело № <\/span><a href="\/case(?<link>[^"]+)">(?<code>[^<]+)(?:[^>]+>){8}(?<date>[^<]+).*?Статья: (?<content>[^<]+)/g
  )).map(c => ({
    link: domain + c[1],
    code: c[2],
    start_date: ddd(c[3]),
    content: `${c[4]}\nОтветчик: ${defendant}`,
  }));
}

export const courtCasesPskovMagistrate = (data: string, domain: string): any[] => {
  return Array.from(data.matchAll(
    /<td>(?<code>[0-9А-яЁё-]+\/\d{1,3}\/\d{4})<\/td>\s*<td>(?<date>(?:\d{2}-){2}\d{4})(?:[^>]+>){6}(?<status>[^<]+)(?:[^>]+>){2}(?<defendant>[^<]+)(?:[^>]+>){2}<a href="(?<link>[^"]+)"/g
  )).map(c => ({
    code: c[1],
    start_date: c[2].replaceAll('-', '.'),
    content: `Статус: ${c[3]}\nОтветчик: ${c[4]}`,
    link: domain + c[5],
  }));
}

export const courtCasesMoscowMagistrate = (data: string, domain: string): any[] => {
  const _match = (s: string): string | null => {
    const m = s.match(/\d{2}\.\d{2}\.\d{4}/);
    return m == null ? null : m[0];
  };

  const chunk = data.match(/searchResultContainer".*?<\/section>/s);
  return !chunk ? [] : Array.from(chunk[0].matchAll(
    /<nobr><a target="_blank" class="detailsLink" href="(?<link>[^"]+)">(?<code>[^<]+).*?Истец:(?:[^>]+>\s*){1}(?<petitioner>[^<]+)(?:[^>]+>\s*){3}(?<defendant>[^<]+)(?:[^>]+>\s*){7}(?<status>[^<]+)/gs
  )).map(c => ({
    link: domain + c[1],
    code: c[2],
    start_date: _match(c[5]),
    content: `Истец: ${c[3]}\nОтветчик: ${c[4]}\nРешение: ${c[5].trim()}`,
  }));
}

export const courtCasesHMAOMagistrate = (data: string, domain: string): any[] => {
  return Array.from(data.matchAll(
    /<td>(?<code>[0-9А-яЁё-]+\/\d{4}\/\d{4})<\/td>\s*<td>(?<date>(?:\d{2}-){2}\d{4})<\/td>\s*<td>(?<petitioner>[^<]+)<\/td>\s*<td>(?<defendant>[^<]+)<\/td>\s*<td>(?<content>[^<]+)<\/td>\s*<td>(?<judge>[^<]+)<\/td>\s*<td>(?<status>[^<]+)(?:[^>]+>){4}<a href="(?<link>[^">]+)"/g
  )).map(c => ({
    code: c[1],
    start_date: c[2].replaceAll('-', '.'),
    content: `Истец: ${c[3]}, ответчик: ${c[4]}, судья: ${c[6]}\nРешение: ${c[5]}, стадия: ${c[7]}`,
    link: domain + c[8],
  }));
}
