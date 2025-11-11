import { describe, it, expect } from "vitest";
import { LocaleGenerator } from "../core/locale-generator";
import type { NamingConfig } from "../core/code-generator";

describe("LocaleGenerator", () => {
  const generator = new LocaleGenerator();

  const mockNaming: NamingConfig = {
    moduleName: "vendors",
    moduleNamePascal: "Vendors",
    moduleNameCamel: "vendors",
    moduleNameUpperSnake: "VENDORS",
    entitySingular: "vendor",
    entitySingularPascal: "Vendor",
    entitySingularCamel: "vendor",
    entitySingularKebab: "vendor",
    entityPlural: "vendors",
    entityPluralPascal: "Vendors",
    entityPluralCamel: "vendors",
    entityPluralKebab: "vendors",
  };

  describe("generateModuleLocales", () => {
    it("should generate locale structure for list blade", () => {
      const result = generator.generateModuleLocales(mockNaming, [
        {
          type: "list",
          columns: [
            { key: "name", title: "Name" },
            { key: "email", title: "Email" },
          ],
        },
      ]);

      expect(result).toHaveProperty("VENDORS");
      expect(result.VENDORS).toHaveProperty("MENU");
      expect(result.VENDORS).toHaveProperty("PAGES");
      
      const pages = result.VENDORS as any;
      expect(pages.PAGES).toHaveProperty("LIST");
      expect(pages.PAGES.LIST).toHaveProperty("TITLE");
      expect(pages.PAGES.LIST).toHaveProperty("TOOLBAR");
      expect(pages.PAGES.LIST.TABLE).toHaveProperty("HEADER");
    });

    it("should generate locale structure for details blade", () => {
      const result = generator.generateModuleLocales(mockNaming, [
        {
          type: "details",
          fields: [
            { key: "name", as: "VcInput", label: "Name" },
            { key: "email", as: "VcInput", label: "Email" },
          ],
        },
      ]);

      const pages = result.VENDORS as any;
      expect(pages.PAGES).toHaveProperty("DETAILS");
      expect(pages.PAGES.DETAILS).toHaveProperty("TITLE");
      expect(pages.PAGES.DETAILS).toHaveProperty("TOOLBAR");
      expect(pages.PAGES.DETAILS).toHaveProperty("FORM");
      expect(pages.PAGES.DETAILS).toHaveProperty("ALERTS");
    });

    it("should generate proper column headers", () => {
      const result = generator.generateModuleLocales(mockNaming, [
        {
          type: "list",
          columns: [
            { key: "name", title: "Vendor Name" },
            { key: "email", title: "Email Address" },
            { key: "status", title: "Status" },
          ],
        },
      ]);

      const pages = result.VENDORS as any;
      const headers = pages.PAGES.LIST.TABLE.HEADER;
      
      expect(headers.NAME).toBe("Vendor Name");
      expect(headers.EMAIL).toBe("Email Address");
      expect(headers.STATUS).toBe("Status");
    });
  });

  describe("extractI18nKeys", () => {
    it("should extract i18n keys from code", () => {
      const code = `
        const title = computed(() => t("VENDORS.PAGES.LIST.TITLE"));
        const subtitle = $t("VENDORS.PAGES.LIST.SUBTITLE");
        const action = computed(() => t("VENDORS.TOOLBAR.ADD"));
      `;

      const keys = generator.extractI18nKeys(code);

      expect(keys).toContain("VENDORS.PAGES.LIST.TITLE");
      expect(keys).toContain("VENDORS.PAGES.LIST.SUBTITLE");
      expect(keys).toContain("VENDORS.TOOLBAR.ADD");
      expect(keys).toHaveLength(3);
    });
  });

  describe("generateLocalesIndex", () => {
    it("should generate locales index.ts file", () => {
      const result = generator.generateLocalesIndex();

      expect(result).toContain('import en from "./en.json"');
      expect(result).toContain("export");
      expect(result).toContain("en");
    });
  });
});

