import { describe, it, expect } from "vitest";
import { resolveLocale, resolveLocaleSync } from "./resolveLocale";
import { enUS } from "date-fns/locale";

describe("resolveLocale", () => {
  it("returns enUS for 'en-US'", async () => {
    const locale = await resolveLocale("en-US");
    expect(locale).toBe(enUS);
  });

  it("returns enUS for 'en'", async () => {
    const locale = await resolveLocale("en");
    expect(locale).toBe(enUS);
  });

  it("returns enUS as fallback for unknown locale 'xx-XX'", async () => {
    const locale = await resolveLocale("xx-XX");
    expect(locale).toBe(enUS);
  });

  it("returns correct locale for 'de' (dynamic load)", async () => {
    const locale = await resolveLocale("de");
    expect(locale).toBeDefined();
    expect(locale).not.toBe(enUS);
  });

  it("returns correct locale for 'fr-CA' (compound, dynamic load)", async () => {
    const locale = await resolveLocale("fr-CA");
    expect(locale).toBeDefined();
    expect(locale).not.toBe(enUS);
  });
});

describe("resolveLocaleSync", () => {
  it("returns cached enUS for 'en-US'", () => {
    const locale = resolveLocaleSync("en-US");
    expect(locale).toBe(enUS);
  });

  it("returns enUS fallback for uncached locale", () => {
    const locale = resolveLocaleSync("zz-ZZ");
    expect(locale).toBe(enUS);
  });
});
