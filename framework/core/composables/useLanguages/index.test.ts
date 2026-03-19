import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { LanguageServiceKey } from "@framework/injection-keys";
import { InjectionError } from "@core/utilities";

// Mock the language service to avoid pulling in i18n, vee-validate, etc.
const mockLanguageService = {
  setLocale: vi.fn(),
  currentLocale: { value: "en" },
  getLocaleByTag: vi.fn((tag: string) => tag),
  resolveCamelCaseLocale: vi.fn((locale: string) => locale),
  getFlag: vi.fn().mockResolvedValue("flag.svg"),
  getCountryCode: vi.fn().mockReturnValue("us"),
};

vi.mock("@core/services/language-service", () => ({
  createLanguageService: () => ({ ...mockLanguageService }),
}));

import { useLanguages, provideLanguages } from "./index";

describe("useLanguages", () => {
  describe("without provider", () => {
    // useLanguages without injection context returns a fallback
    it("returns fallback language service outside injection context", () => {
      // Call outside any component — no injection context
      const result = useLanguages();
      expect(result).toBeDefined();
      expect(result.setLocale).toBeTypeOf("function");
    });
  });

  describe("with injection context but no provider", () => {
    it("throws InjectionError when service is not provided", () => {
      expect(() => {
        mountWithSetup(() => useLanguages());
      }).toThrow(InjectionError);
    });

    it("error message mentions LanguageService", () => {
      expect(() => {
        mountWithSetup(() => useLanguages());
      }).toThrow(/LanguageService/);
    });
  });

  describe("with provider", () => {
    function mountWithProvider<T>(setupFn: () => T) {
      let result: T;
      const Inner = defineComponent({
        setup() {
          result = setupFn();
          return () => h("div");
        },
      });
      const Outer = defineComponent({
        setup() {
          provide(LanguageServiceKey, mockLanguageService as any);
          return () => h(Inner);
        },
      });
      const wrapper = mount(Outer);
      return { result: result!, wrapper };
    }

    it("returns the language service", () => {
      const { result } = mountWithProvider(() => useLanguages());
      expect(result).toBeDefined();
      expect(result.setLocale).toBeTypeOf("function");
      expect(result.currentLocale).toBeDefined();
      expect(result.getLocaleByTag).toBeTypeOf("function");
      expect(result.resolveCamelCaseLocale).toBeTypeOf("function");
      expect(result.getFlag).toBeTypeOf("function");
      expect(result.getCountryCode).toBeTypeOf("function");
    });
  });

  describe("provideLanguages", () => {
    it("creates and provides a service", () => {
      const { result } = mountWithSetup(() => provideLanguages());
      expect(result).toBeDefined();
      expect(result.setLocale).toBeTypeOf("function");
    });

    it("returns existing service if already provided", () => {
      let first: any;
      let second: any;

      const Inner = defineComponent({
        setup() {
          second = provideLanguages();
          return () => h("div");
        },
      });
      const Outer = defineComponent({
        setup() {
          first = provideLanguages();
          return () => h(Inner);
        },
      });
      mount(Outer);
      expect(first).toBe(second);
    });
  });
});
