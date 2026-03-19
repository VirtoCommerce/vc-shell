import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  configure: vi.fn(),
  localize: vi.fn(() => vi.fn()),
  setVeeI18nLocale: vi.fn(),
  localStorageValue: { value: "" },
  localeValue: { value: "en" },
}));

vi.mock("vee-validate", () => ({
  configure: mocks.configure,
}));

vi.mock("@vee-validate/i18n", () => ({
  setLocale: mocks.setVeeI18nLocale,
  localize: mocks.localize,
}));

vi.mock("iso-639-1", () => ({
  default: {
    getNativeName: vi.fn((code: string) => {
      const map: Record<string, string> = { en: "English", fr: "Fran\u00e7ais", de: "Deutsch" };
      return map[code] || "";
    }),
  },
}));

vi.mock("@vueuse/core", () => ({
  useLocalStorage: vi.fn(() => mocks.localStorageValue),
}));

vi.mock("@core/constants", () => ({
  languageToCountryMap: {
    en: "us",
    fr: "fr",
    de: "de",
    "en-gb": "gb",
  },
}));

vi.mock("@core/plugins/i18n", () => ({
  i18n: {
    global: {
      locale: mocks.localeValue,
      availableLocales: ["en", "fr", "de"],
      getLocaleMessage: vi.fn(() => ({ messages: { required: "Required" } })),
    },
  },
}));

import { createLanguageService } from "./language-service";

describe("createLanguageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.localeValue.value = "en";
    mocks.localStorageValue.value = "";
  });

  describe("currentLocale", () => {
    it("returns i18n locale when no saved locale", () => {
      const service = createLanguageService();
      expect(service.currentLocale.value).toBe("en");
    });

    it("returns saved locale when it is available", () => {
      mocks.localStorageValue.value = "fr";
      const service = createLanguageService();
      expect(service.currentLocale.value).toBe("fr");
    });
  });

  describe("setLocale", () => {
    it("sets i18n locale to the resolved locale", () => {
      const service = createLanguageService();
      service.setLocale("fr");
      expect(mocks.localeValue.value).toBe("fr");
    });

    it("falls back to en for unsupported locale", () => {
      const service = createLanguageService();
      service.setLocale("xx-unknown");
      expect(mocks.localeValue.value).toBe("en");
    });

    it("configures vee-validate with localized messages", () => {
      const service = createLanguageService();
      service.setLocale("fr");
      expect(mocks.configure).toHaveBeenCalled();
      expect(mocks.localize).toHaveBeenCalledWith("fr", expect.any(Object));
      expect(mocks.setVeeI18nLocale).toHaveBeenCalledWith("fr");
    });

    it("saves locale to localStorage", () => {
      const service = createLanguageService();
      service.setLocale("de");
      expect(mocks.localStorageValue.value).toBe("de");
    });
  });

  describe("getLocaleByTag", () => {
    it("returns native name for a valid locale tag", () => {
      const service = createLanguageService();
      expect(service.getLocaleByTag("en-US")).toBe("English");
    });

    it("returns native name for two-letter code", () => {
      const service = createLanguageService();
      expect(service.getLocaleByTag("fr")).toBe("Fran\u00e7ais");
    });

    it("returns undefined for empty string", () => {
      const service = createLanguageService();
      expect(service.getLocaleByTag("")).toBeUndefined();
    });
  });

  describe("getCountryCode", () => {
    it("returns mapped country code for known language", () => {
      const service = createLanguageService();
      expect(service.getCountryCode("en")).toBe("us");
    });

    it("returns mapped country code for culture code", () => {
      const service = createLanguageService();
      expect(service.getCountryCode("en-gb")).toBe("gb");
    });

    it("returns xx for unknown language", () => {
      const service = createLanguageService();
      expect(service.getCountryCode("zz-unknown")).toBe("xx");
    });

    it("falls back to two-letter prefix", () => {
      const service = createLanguageService();
      expect(service.getCountryCode("fr-CA")).toBe("fr");
    });
  });

  describe("resolveCamelCaseLocale", () => {
    it("resolves camelCase to hyphenated and falls back to en if unsupported", () => {
      const service = createLanguageService();
      expect(service.resolveCamelCaseLocale("enGB")).toBe("en");
    });

    it("returns en for empty string", () => {
      const service = createLanguageService();
      expect(service.resolveCamelCaseLocale("")).toBe("en");
    });
  });
});
