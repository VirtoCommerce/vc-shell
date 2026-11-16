import { describe, it, expect, beforeAll } from "vitest";
import { i18n } from "@core/plugins/i18n";
import * as locales from "@locales";

const t = (locale: string, key: string, count: number) => {
  i18n.global.locale.value = locale;
  return i18n.global.t(key, count);
};

describe("i18n plural rules", () => {
  beforeAll(() => {
    i18n.global.mergeLocaleMessage("en", { T: { TWO: "{count} file | {count} files" } });
    i18n.global.mergeLocaleMessage("ru", {
      T: { THREE: "{count} файл | {count} файла | {count} файлов", TWO: "файл | файлы" },
    });
    i18n.global.mergeLocaleMessage("pl", { T: { THREE: "{count} plik | {count} pliki | {count} plików" } });
    i18n.global.mergeLocaleMessage("ar", { T: { SIX: "zero | one | two | few | many | other" } });
    i18n.global.mergeLocaleMessage("fr", { T: { TWO: "{count} fichier | {count} fichiers" } });
    i18n.global.mergeLocaleMessage("ja", { T: { ONE: "{count} 件" } });
  });

  it("keeps vue-i18n's default for languages without a rule", () => {
    expect(t("en", "T.TWO", 1)).toBe("1 file");
    expect(t("en", "T.TWO", 0)).toBe("0 files");
    expect(t("en", "T.TWO", 5)).toBe("5 files");
  });

  it("picks the one/few/many form in Russian and Polish", () => {
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => t("ru", "T.THREE", n))).toEqual([
      "1 файл",
      "2 файла",
      "5 файлов",
      "11 файлов",
      "21 файл",
      "22 файла",
      "25 файлов",
    ]);
    expect([1, 3, 5, 12, 22].map((n) => t("pl", "T.THREE", n))).toEqual([
      "1 plik",
      "3 pliki",
      "5 plików",
      "12 plików",
      "22 pliki",
    ]);
  });

  it("falls back to the default rule for a message with another number of forms", () => {
    expect(t("ru", "T.TWO", 1)).toBe("файл");
    expect(t("ru", "T.TWO", 5)).toBe("файлы");
  });

  it("picks all six Arabic forms", () => {
    expect([0, 1, 2, 3, 11, 100].map((n) => t("ar", "T.SIX", n))).toEqual([
      "zero",
      "one",
      "two",
      "few",
      "many",
      "other",
    ]);
  });

  it("uses the singular for zero in French", () => {
    expect(t("fr", "T.TWO", 0)).toBe("0 fichier");
    expect(t("fr", "T.TWO", 2)).toBe("2 fichiers");
  });

  it("uses the single form in Japanese", () => {
    expect(t("ja", "T.ONE", 7)).toBe("7 件");
  });
});

describe("framework locales", () => {
  it("ships every language with the plural forms its rule expects", () => {
    const forms: Record<string, number> = { ar: 6, ru: 3, pl: 3, ja: 1, zh: 1 };
    const en = locales.en as unknown as Record<string, unknown>;
    const plurals: string[] = [];
    const walk = (node: Record<string, unknown>, path: string[]) => {
      for (const [key, value] of Object.entries(node)) {
        if (key === "default") continue;
        if (typeof value === "string") {
          if (value.includes(" | ")) plurals.push([...path, key].join("."));
        } else if (value && typeof value === "object") {
          walk(value as Record<string, unknown>, [...path, key]);
        }
      }
    };
    walk(en, []);

    const get = (obj: unknown, path: string) =>
      path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
    for (const [lang, messages] of Object.entries(locales)) {
      for (const key of plurals) {
        const value = get(messages, key) as string;
        expect(value.split(" | ").length, `${lang}: ${key}`).toBe(forms[lang] ?? 2);
      }
    }
  });
});
