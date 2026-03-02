import { type Locale } from "date-fns";
import { enUS } from "date-fns/locale";

const localeCache = new Map<string, Locale>();
localeCache.set("en-US", enUS);
localeCache.set("en", enUS);

export async function resolveLocale(localeCode: string): Promise<Locale> {
  if (localeCache.has(localeCode)) {
    return localeCache.get(localeCode)!;
  }
  try {
    const mod = await import(/* @vite-ignore */ `date-fns/locale/${localeCode}`);
    const dateFnsKey = localeCode.replace("-", "");
    const locale = mod.default ?? mod[dateFnsKey] ?? enUS;
    localeCache.set(localeCode, locale);
    return locale;
  } catch {
    const base = localeCode.split("-")[0];
    if (base !== localeCode) {
      try {
        const mod = await import(/* @vite-ignore */ `date-fns/locale/${base}`);
        const locale = mod.default ?? mod[base] ?? enUS;
        localeCache.set(localeCode, locale);
        return locale;
      } catch {
        /* fall through */
      }
    }
    localeCache.set(localeCode, enUS);
    return enUS;
  }
}

export function resolveLocaleSync(localeCode: string): Locale {
  if (localeCache.has(localeCode)) {
    return localeCache.get(localeCode)!;
  }
  void resolveLocale(localeCode);
  return enUS;
}
