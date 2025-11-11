import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ModuleRegistrar } from "../core/module-registrar";
import type { NamingConfig } from "../core/code-generator";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("ModuleRegistrar", () => {
  const registrar = new ModuleRegistrar();
  let tempDir: string;

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

  beforeEach(() => {
    // Create temp directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vc-shell-test-"));
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("registerModule", () => {
    it("should add import and .use() call to main.ts", async () => {
      const mainTsPath = path.join(tempDir, "src", "main.ts");
      const originalContent = `import { createApp } from "vue";
import { router } from "./router";

const app = createApp(App)
  .use(router);

app.mount("#app");
`;
      fs.writeFileSync(mainTsPath, originalContent);

      await registrar.registerModule("vendors", mockNaming, tempDir);

      const updatedContent = fs.readFileSync(mainTsPath, "utf-8");

      // Should have import
      expect(updatedContent).toContain('import VendorsModule from "./modules/vendors"');

      // Should have .use() call
      expect(updatedContent).toContain(".use(VendorsModule, { router })");
    });

    it("should not add duplicate imports", async () => {
      const mainTsPath = path.join(tempDir, "src", "main.ts");
      const originalContent = `import { createApp } from "vue";
import VendorsModule from "./modules/vendors";
import { router } from "./router";

const app = createApp(App)
  .use(VendorsModule, { router })
  .use(router);

app.mount("#app");
`;
      fs.writeFileSync(mainTsPath, originalContent);

      await registrar.registerModule("vendors", mockNaming, tempDir);

      const updatedContent = fs.readFileSync(mainTsPath, "utf-8");

      // Should not duplicate
      const importCount = (updatedContent.match(/import VendorsModule/g) || []).length;
      expect(importCount).toBe(1);
    });
  });

  describe("validateRegistration", () => {
    it("should validate that module is registered", () => {
      const mainTsPath = path.join(tempDir, "src", "main.ts");
      const content = `import VendorsModule from "./modules/vendors";
import { router } from "./router";

const app = createApp(App)
  .use(VendorsModule, { router })
  .use(router);
`;
      fs.writeFileSync(mainTsPath, content);

      const result = registrar.validateRegistration("vendors", mockNaming, tempDir);

      expect(result).toBe(true);
    });

    it("should return false if module not registered", () => {
      const mainTsPath = path.join(tempDir, "src", "main.ts");
      const content = `import { router } from "./router";

const app = createApp(App)
  .use(router);
`;
      fs.writeFileSync(mainTsPath, content);

      const result = registrar.validateRegistration("vendors", mockNaming, tempDir);

      expect(result).toBe(false);
    });
  });
});

