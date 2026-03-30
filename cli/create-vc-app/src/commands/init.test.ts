import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initCommand } from "./init.js";

const templateRoot = path.resolve(import.meta.dirname, "..", "templates");

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-vc-app-test-"));
}

function readGenerated(root: string, filePath: string): string {
  return fs.readFileSync(path.join(root, filePath), "utf-8");
}

function fileExists(root: string, filePath: string): boolean {
  return fs.existsSync(path.join(root, filePath));
}

describe("initCommand — standalone", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("generates without module when --module-name is not provided", async () => {
    const projectName = path.basename(root);
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    // No module import/use
    expect(mainTs).not.toContain('from "./modules/');
    expect(mainTs).not.toMatch(/app\.use\(\w+\);\s*\n\s*app\.use\(router\)/);

    // No modules directory at all
    expect(fileExists(root, "src/modules")).toBe(false);

    // Core files exist
    expect(fileExists(root, "src/main.ts")).toBe(true);
    expect(fileExists(root, "src/bootstrap.ts")).toBe(true);
    expect(fileExists(root, "src/router/index.ts")).toBe(true);
    expect(fileExists(root, "package.json")).toBe(true);
  });

  it("generates with module when --module-name is provided", async () => {
    await initCommand(
      { _: [root], type: "standalone", "module-name": "Orders", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    // Module imported and used
    expect(mainTs).toContain('import Orders from "./modules/orders"');
    expect(mainTs).toContain("app.use(Orders)");

    // Module files generated
    expect(fileExists(root, "src/modules/orders/index.ts")).toBe(true);
    expect(fileExists(root, "src/modules/orders/pages/list.vue")).toBe(true);
    expect(fileExists(root, "src/modules/orders/pages/details.vue")).toBe(true);
    expect(fileExists(root, "src/modules/orders/composables/useList.ts")).toBe(true);
    expect(fileExists(root, "src/modules/orders/composables/useDetails.ts")).toBe(true);
    expect(fileExists(root, "src/modules/orders/locales/en.json")).toBe(true);
  });

  it("generates with mocks when --mocks is provided", async () => {
    await initCommand(
      { _: [root], type: "standalone", mocks: true, overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    // Sample module imported
    expect(mainTs).toContain('import Sample from "./modules/sample"');
    expect(mainTs).toContain("app.use(Sample)");

    // Sample module files exist
    expect(fileExists(root, "src/modules/sample/index.ts")).toBe(true);

    // No custom module (no --module-name)
    expect(mainTs).not.toMatch(/import \w+ from "\.\/modules\/(?!sample)/);
  });

  it("generates with both module and mocks", async () => {
    await initCommand(
      { _: [root], type: "standalone", "module-name": "Reviews", mocks: true, overwrite: true } as unknown as Record<
        string,
        unknown
      >,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    expect(mainTs).toContain('import Reviews from "./modules/reviews"');
    expect(mainTs).toContain("app.use(Reviews)");
    expect(mainTs).toContain('import Sample from "./modules/sample"');
    expect(mainTs).toContain("app.use(Sample)");

    expect(fileExists(root, "src/modules/reviews/index.ts")).toBe(true);
    expect(fileExists(root, "src/modules/sample/index.ts")).toBe(true);
  });

  it("includes dashboard when --dashboard is set", async () => {
    await initCommand(
      { _: [root], type: "standalone", dashboard: true, overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const bootstrap = readGenerated(root, "src/bootstrap.ts");

    expect(bootstrap).toContain("addMenuItem");
    expect(bootstrap).toContain("registerDashboardWidget");
    expect(bootstrap).toContain("SHELL.MENU.DASHBOARD");
  });

  it("excludes dashboard by default in non-interactive mode", async () => {
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const bootstrap = readGenerated(root, "src/bootstrap.ts");

    expect(bootstrap).not.toContain("addMenuItem");
    expect(bootstrap).not.toContain("registerDashboardWidget");
  });

  it("includes AI agent config when --ai-agent is set", async () => {
    await initCommand(
      { _: [root], type: "standalone", "ai-agent": true, overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    expect(mainTs).toContain("aiAgent:");
    expect(mainTs).toContain("APP_AI_AGENT_URL");
  });

  it("excludes AI agent config by default", async () => {
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    expect(mainTs).not.toContain("aiAgent:");
  });

  it("includes tenant routes when --tenant-routes is set", async () => {
    await initCommand(
      { _: [root], type: "standalone", "tenant-routes": true, overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).toContain("tenantId");
    expect(routes).toContain("tenantIdRegex");
  });

  it("excludes tenant routes by default", async () => {
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).not.toContain("tenantId");
    expect(routes).not.toContain("tenantIdRegex");
    expect(routes).toContain('path: "/"');
  });

  it("dashboard adds routes and pages", async () => {
    await initCommand(
      { _: [root], type: "standalone", dashboard: true, overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).toContain('import Dashboard from "../pages/Dashboard.vue"');
    expect(routes).toContain('name: "Dashboard"');
  });

  it("no dashboard route when dashboard is off", async () => {
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).not.toContain("Dashboard");
  });

  it("all flags combined generate valid output", async () => {
    await initCommand(
      {
        _: [root],
        type: "standalone",
        "module-name": "Catalog",
        "tenant-routes": true,
        "ai-agent": true,
        dashboard: true,
        mocks: true,
        overwrite: true,
      } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");
    const bootstrap = readGenerated(root, "src/bootstrap.ts");
    const routes = readGenerated(root, "src/router/routes.ts");

    // Module
    expect(mainTs).toContain('import Catalog from "./modules/catalog"');
    expect(mainTs).toContain("app.use(Catalog)");

    // Sample
    expect(mainTs).toContain('import Sample from "./modules/sample"');

    // AI agent
    expect(mainTs).toContain("aiAgent:");

    // Dashboard
    expect(bootstrap).toContain("registerDashboardWidget");
    expect(routes).toContain("Dashboard");

    // Tenant routes
    expect(routes).toContain("tenantId");

    // No EJS artifacts
    expect(mainTs).not.toContain("<%");
    expect(bootstrap).not.toContain("<%");
    expect(routes).not.toContain("<%");

    // No triple blank lines
    expect(mainTs).not.toMatch(/\n{3,}/);
    expect(bootstrap).not.toMatch(/\n{3,}/);
  });

  it("has no extra blank lines in main.ts", async () => {
    await initCommand(
      { _: [root], type: "standalone", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const mainTs = readGenerated(root, "src/main.ts");

    // No triple+ blank lines (sign of bad EJS trim)
    expect(mainTs).not.toMatch(/\n{3,}/);
  });
});

describe("initCommand — standalone module locales", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("module pages use $t() for all user-facing strings", async () => {
    await initCommand(
      { _: [root], type: "standalone", "module-name": "Orders", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const listVue = readGenerated(root, "src/modules/orders/pages/list.vue");
    const detailsVue = readGenerated(root, "src/modules/orders/pages/details.vue");

    // list.vue uses $t for title and column headers
    expect(listVue).toContain("$t('ORDERS.PAGES.LIST.TITLE')");
    expect(listVue).toContain("$t('ORDERS.PAGES.LIST.COLUMNS.NAME')");
    expect(listVue).toContain("$t('ORDERS.PAGES.LIST.COLUMNS.CREATED_DATE')");

    // list.vue toolbar uses t()
    expect(listVue).toContain('t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH")');
    expect(listVue).toContain('t("ORDERS.PAGES.LIST.TOOLBAR.ADD")');

    // details.vue uses $t for labels
    expect(detailsVue).toContain("$t('ORDERS.PAGES.DETAILS.FIELDS.NAME')");

    // details.vue toolbar uses t()
    expect(detailsVue).toContain('t("ORDERS.PAGES.DETAILS.TOOLBAR.SAVE")');

    // details.vue title computed uses t()
    expect(detailsVue).toContain('t("ORDERS.PAGES.DETAILS.TITLE")');
    expect(detailsVue).toContain('t("ORDERS.PAGES.DETAILS.TITLE_NEW")');

    // details.vue close confirmation uses t()
    expect(detailsVue).toContain('t("ORDERS.ALERTS.CLOSE_CONFIRMATION")');
  });

  it("locales en.json has all required keys", async () => {
    await initCommand(
      { _: [root], type: "standalone", "module-name": "Orders", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const locales = JSON.parse(readGenerated(root, "src/modules/orders/locales/en.json"));

    expect(locales.ORDERS).toBeDefined();
    expect(locales.ORDERS.MENU.TITLE).toBe("Orders");
    expect(locales.ORDERS.PAGES.LIST.TITLE).toBe("Orders");
    expect(locales.ORDERS.PAGES.LIST.COLUMNS.NAME).toBeDefined();
    expect(locales.ORDERS.PAGES.LIST.COLUMNS.CREATED_DATE).toBeDefined();
    expect(locales.ORDERS.PAGES.LIST.TOOLBAR.REFRESH).toBeDefined();
    expect(locales.ORDERS.PAGES.LIST.TOOLBAR.ADD).toBeDefined();
    expect(locales.ORDERS.PAGES.DETAILS.TITLE).toBeDefined();
    expect(locales.ORDERS.PAGES.DETAILS.TITLE_NEW).toBeDefined();
    expect(locales.ORDERS.PAGES.DETAILS.FIELDS.NAME).toBeDefined();
    expect(locales.ORDERS.PAGES.DETAILS.TOOLBAR.SAVE).toBeDefined();
    expect(locales.ORDERS.ALERTS.CLOSE_CONFIRMATION).toBeDefined();
  });

  it("module index.ts imports and passes locales", async () => {
    await initCommand(
      { _: [root], type: "standalone", "module-name": "Orders", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    const indexTs = readGenerated(root, "src/modules/orders/index.ts");

    expect(indexTs).toContain('import * as locales from "./locales"');
    expect(indexTs).toContain("locales");
    expect(indexTs).toContain("defineAppModule");
  });
});

describe("initCommand — dynamic-module", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("always generates module even without --module-name", async () => {
    await initCommand(
      { _: [root], type: "dynamic-module", overwrite: true } as unknown as Record<string, unknown>,
      templateRoot,
    );

    // Module files are rendered into src/modules/ (flat, not nested for dynamic-module)
    expect(fileExists(root, "src/modules/index.ts")).toBe(true);
    expect(fileExists(root, "src/modules/pages")).toBe(true);
    expect(fileExists(root, "src/modules/locales")).toBe(true);
  });

  it("uses provided --module-name", async () => {
    await initCommand(
      { _: [root], type: "dynamic-module", "module-name": "Reviews", overwrite: true } as unknown as Record<
        string,
        unknown
      >,
      templateRoot,
    );

    const indexTs = readGenerated(root, "src/modules/index.ts");
    expect(indexTs).toContain("defineAppModule");

    const enJson = JSON.parse(readGenerated(root, "src/modules/locales/en.json"));
    expect(enJson.REVIEWS).toBeDefined();
  });
});
