const LOCALE_SHORTCUTS: [string, string][] = [
  ["LLLL", "PPPp"],
  ["LLL", "PPp"],
  ["LTS", "pp"],
  ["LT", "p"],
  ["LL", "PP"],
  ["L", "P"],
];

const TOKEN_MAP: [RegExp, string][] = [
  [/YYYY/g, "yyyy"],
  [/YY/g, "yy"],
  [/dddd/g, "EEEE"],
  [/ddd/g, "EEE"],
  [/DD/g, "dd"],
  [/Do/g, "do"],
  [/D(?![\w])/g, "d"],
  [/A/g, "a"],
];

export function convertMomentFormat(momentFormat: string): string {
  let result = momentFormat;
  for (const [moment, dateFns] of LOCALE_SHORTCUTS) {
    result = result.split(moment).join(dateFns);
  }
  for (const [pattern, replacement] of TOKEN_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
