import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import prettier from "prettier";
import { initCommand } from "./init.js";
import { renderDir, renderTemplate } from "../engine/template.js";
import { buildTemplateData } from "../engine/helpers.js";

const templateRoot = path.resolve(import.meta.dirname, "..", "templates");

const SKIP_DIRS = new Set(["node_modules", ".git", ".yarn", "dist"]);

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = path.join(dir, entry);
    if (fs.statSync(p).isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

/** Paths (relative to `root`) that Prettier would reformat. */
async function unformattedFiles(root: string): Promise<string[]> {
  const bad: string[] = [];
  for (const file of walkFiles(root)) {
    const info = await prettier.getFileInfo(file, { resolveConfig: true });
    if (!info.inferredParser || info.ignored) continue;

    const source = fs.readFileSync(file, "utf-8");
    // Must match the Prettier CLI (which reads `.editorconfig`), otherwise this
    // only re-asserts whatever `formatGenerated` did rather than checking it.
    const config = await prettier.resolveConfig(file, { editorconfig: true });
    if (!(await prettier.check(source, { ...config, filepath: file }))) {
      bad.push(path.relative(root, file));
    }
  }
  return bad;
}

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
    const _projectName = path.basename(root);
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "standalone", "module-name": "Orders", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "standalone", mocks: true, overwrite: true }, templateRoot);

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
      { _: [root], type: "standalone", "module-name": "Reviews", mocks: true, overwrite: true },
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
    await initCommand({ _: [root], type: "standalone", dashboard: true, overwrite: true }, templateRoot);

    const bootstrap = readGenerated(root, "src/bootstrap.ts");

    expect(bootstrap).toContain("addMenuItem");
    expect(bootstrap).toContain("registerDashboardWidget");
    expect(bootstrap).toContain("SHELL.MENU.DASHBOARD");
  });

  it("excludes dashboard by default in non-interactive mode", async () => {
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

    const bootstrap = readGenerated(root, "src/bootstrap.ts");

    expect(bootstrap).not.toContain("addMenuItem");
    expect(bootstrap).not.toContain("registerDashboardWidget");
  });

  it("includes AI agent config when --ai-agent is set", async () => {
    await initCommand({ _: [root], type: "standalone", "ai-agent": true, overwrite: true }, templateRoot);

    const mainTs = readGenerated(root, "src/main.ts");

    expect(mainTs).toContain("aiAgent:");
    expect(mainTs).toContain("APP_AI_AGENT_URL");
  });

  it("excludes AI agent config by default", async () => {
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

    const mainTs = readGenerated(root, "src/main.ts");

    expect(mainTs).not.toContain("aiAgent:");
  });

  it("includes Module Federation host when --module-federation is set", async () => {
    await initCommand({ _: [root], type: "standalone", "module-federation": true, overwrite: true }, templateRoot);

    const mainTs = readGenerated(root, "src/main.ts");
    const viteConfig = readGenerated(root, "vite.config.mts");
    const pkg = JSON.parse(readGenerated(root, "package.json"));

    expect(mainTs).toContain('import { registerRemoteModules } from "@vc-shell/mf-host"');
    // Prettier may wrap the call, so match the parts rather than one literal line.
    expect(mainTs).toMatch(/registerRemoteModules\(app,\s*\{\s*router,\s*appName: "[^"]+",?\s*\}\);/);
    // Must run before router.isReady() and mount, so the provide/inject keys
    // reach mounted components. indexOf returns -1 for a missing needle, so
    // assert the call is present before comparing offsets.
    const registerAt = mainTs.indexOf("registerRemoteModules(app,");
    expect(registerAt).toBeGreaterThan(-1);
    expect(registerAt).toBeLessThan(mainTs.indexOf("await router.isReady()"));
    expect(registerAt).toBeLessThan(mainTs.indexOf('app.mount("#app")'));
    expect(viteConfig).toContain('import { mfHostConfig } from "@vc-shell/mf-host/vite"');
    expect(viteConfig).toContain("...mfHostConfig()");
    expect(pkg.dependencies["@vc-shell/mf-host"]).toBeDefined();
  });

  it("excludes Module Federation host by default", async () => {
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

    const mainTs = readGenerated(root, "src/main.ts");
    const viteConfig = readGenerated(root, "vite.config.mts");
    const pkg = JSON.parse(readGenerated(root, "package.json"));

    expect(mainTs).not.toContain("@vc-shell/mf-host");
    expect(mainTs).not.toContain("registerRemoteModules");
    expect(viteConfig).not.toContain("mfHostConfig");
    expect(pkg.dependencies["@vc-shell/mf-host"]).toBeUndefined();
  });

  it("includes tenant routes when --tenant-routes is set", async () => {
    await initCommand({ _: [root], type: "standalone", "tenant-routes": true, overwrite: true }, templateRoot);

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).toContain("tenantId");
    expect(routes).toContain("tenantIdRegex");
  });

  it("excludes tenant routes by default", async () => {
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).not.toContain("tenantId");
    expect(routes).not.toContain("tenantIdRegex");
    expect(routes).toContain('path: "/"');
  });

  it("dashboard adds routes and pages", async () => {
    await initCommand({ _: [root], type: "standalone", dashboard: true, overwrite: true }, templateRoot);

    const routes = readGenerated(root, "src/router/routes.ts");

    expect(routes).toContain('import Dashboard from "../pages/Dashboard.vue"');
    expect(routes).toContain('name: "Dashboard"');
  });

  it("no dashboard route when dashboard is off", async () => {
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

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
      },
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
    await initCommand({ _: [root], type: "standalone", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "standalone", "module-name": "Orders", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "standalone", "module-name": "Orders", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "standalone", "module-name": "Orders", overwrite: true }, templateRoot);

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
    await initCommand({ _: [root], type: "dynamic-module", overwrite: true }, templateRoot);

    // Module files are rendered into src/modules/ (flat, not nested for dynamic-module)
    expect(fileExists(root, "src/modules/index.ts")).toBe(true);
    expect(fileExists(root, "src/modules/pages")).toBe(true);
    expect(fileExists(root, "src/modules/locales")).toBe(true);
  });

  it("uses provided --module-name", async () => {
    await initCommand({ _: [root], type: "dynamic-module", "module-name": "Reviews", overwrite: true }, templateRoot);

    const indexTs = readGenerated(root, "src/modules/index.ts");
    expect(indexTs).toContain("defineAppModule");

    const enJson = JSON.parse(readGenerated(root, "src/modules/locales/en.json"));
    expect(enJson.REVIEWS).toBeDefined();
  });
});

// Templates are `.ejs`, so `yarn lint` and `yarn format` cannot see them —
// generating a project and checking the result is the only gate that works.
describe("initCommand — generated output is formatted", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const combos: { name: string; args: Record<string, unknown> }[] = [
    { name: "standalone, no options", args: { type: "standalone" } },
    {
      name: "standalone, all flags",
      args: {
        type: "standalone",
        "module-name": "Catalog",
        "tenant-routes": true,
        "ai-agent": true,
        dashboard: true,
        "module-federation": true,
        mocks: true,
      },
    },
    { name: "standalone, dashboard only", args: { type: "standalone", dashboard: true } },
    { name: "standalone, module federation", args: { type: "standalone", "module-federation": true } },
    {
      name: "standalone, module federation with module",
      args: { type: "standalone", "module-name": "Catalog", "module-federation": true, dashboard: true },
    },
    { name: "dynamic-module", args: { type: "dynamic-module", "module-name": "Reviews" } },
  ];

  for (const { name, args } of combos) {
    it(`is Prettier-clean — ${name}`, async () => {
      await initCommand({ ...args, _: [root], overwrite: true }, templateRoot);

      expect(await unformattedFiles(root)).toEqual([]);
    });
  }
});

// The formatter above would silently absorb template bugs, so assert on the raw
// render too: EJS control tags must slurp their own whitespace.
describe("template rendering leaves no EJS whitespace artifacts", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const combos = [
    { name: "no dashboard, no tenant routes", tenantRoutes: false, dashboard: false },
    { name: "dashboard only", tenantRoutes: false, dashboard: true },
    { name: "tenant routes only", tenantRoutes: true, dashboard: false },
    { name: "dashboard and tenant routes", tenantRoutes: true, dashboard: true },
  ];

  for (const { name, tenantRoutes, dashboard } of combos) {
    it(`renders routes.ts without stray blank lines — ${name}`, async () => {
      const data = buildTemplateData({
        projectName: "demo",
        packageName: "demo",
        projectType: "standalone",
        moduleName: "Orders",
        basePath: "/apps/demo/",
        tenantRoutes,
        dashboard,
        aiAgent: false,
        mocks: false,
      });
      renderDir(path.join(templateRoot, "standalone", "src", "router"), root, data);

      const routes = fs.readFileSync(path.join(root, "routes.ts"), "utf-8");

      expect(routes).not.toContain("<%");
      // A blank line directly after `[`, `{` or before `]`, `}` is an EJS
      // conditional that failed to trim its own newline.
      expect(routes).not.toMatch(/[[{]\n\s*\n/);
      expect(routes).not.toMatch(/\n\s*\n\s*[\]}]/);
      expect(routes).not.toMatch(/\n{3,}/);
    });
  }
});

// Same reasoning for the Module Federation conditionals: assert the raw render,
// not the Prettier-normalised output.
describe("Module Federation templates render without EJS whitespace artifacts", () => {
  let root: string;

  beforeEach(() => {
    root = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const files = ["src/main.ts.ejs", "vite.config.mts.ejs", "_package.json.ejs"];

  for (const moduleFederation of [false, true]) {
    it(`renders cleanly with moduleFederation=${moduleFederation}`, () => {
      const data = buildTemplateData({
        projectName: "demo",
        packageName: "demo",
        moduleName: "Orders",
        basePath: "/apps/demo/",
        tenantRoutes: false,
        dashboard: false,
        aiAgent: false,
        moduleFederation,
        mocks: false,
      });

      for (const file of files) {
        // renderTemplate strips the .ejs suffix from the output path.
        const out = path.join(root, path.basename(file).replace(/\.ejs$/, ""));
        renderTemplate(path.join(templateRoot, "standalone", file), out, data);
        const rendered = fs.readFileSync(out, "utf-8");

        expect(rendered, file).not.toContain("<%");
        expect(rendered, file).not.toMatch(/[[{]\n\s*\n/);
        expect(rendered, file).not.toMatch(/\n\s*\n\s*[\]}]/);
        expect(rendered, file).not.toMatch(/\n{3,}/);
      }

      // The release script rewrites dependency versions in this file, so it must
      // stay line-oriented and, with the conditional off, valid JSON.
      const pkg = fs.readFileSync(path.join(root, "_package.json"), "utf-8");
      if (moduleFederation) {
        expect(pkg).toContain('"@vc-shell/mf-host"');
      } else {
        expect(() => JSON.parse(pkg)).not.toThrow();
        expect(pkg).not.toContain("mf-host");
      }
    });
  }
});
