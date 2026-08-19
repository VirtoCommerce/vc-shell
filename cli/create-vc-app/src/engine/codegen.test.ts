import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import prettier from "prettier";
import { addModuleToMain, addMenuItemToBootstrap } from "./codegen.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "codegen-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function write(name: string, content: string): string {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content);
  return file;
}

/**
 * Prettier throws on a syntax error, so formatting the result is a cheap check
 * that the splice produced parseable TypeScript.
 */
async function expectParses(code: string): Promise<void> {
  await expect(prettier.format(code, { parser: "typescript" })).resolves.toBeTypeOf("string");
}

const MAIN_TS = `import VirtoShellFramework, { notification, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";

async function startApp() {
  const app = createApp(RouterView);

  app.use(VirtoShellFramework, {
    router,
    i18n: {
      locale: import.meta.env.APP_I18N_LOCALE,
    },
  });

  app.use(Orders);
  app.use(router);

  bootstrap(app);
}
`;

describe("addModuleToMain", () => {
  it("adds the import and registers the module before app.use(router)", async () => {
    const file = write("main.ts", MAIN_TS);
    addModuleToMain(file, "reviews");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result).toContain('import Reviews from "./modules/reviews";');
    expect(result).toContain("app.use(Reviews);");

    // Modules must stay in front of the router.
    expect(result.indexOf("app.use(Reviews)")).toBeLessThan(result.indexOf("app.use(router)"));
    expect(result).toMatch(/ {2}app\.use\(Reviews\);\n {2}app\.use\(router\);/);
  });

  it("does not corrupt a multi-line trailing import", async () => {
    const file = write(
      "main.ts",
      `import { createApp } from "vue";
import {
  notification,
  useUser,
} from "@vc-shell/framework";

async function startApp() {
  const app = createApp(RouterView);
  app.use(router);
}
`,
    );
    addModuleToMain(file, "orders");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    // The new import must land after the whole statement, not inside its braces.
    expect(result).toMatch(/} from "@vc-shell\/framework";\nimport Orders from "\.\/modules\/orders";/);
  });

  it("ignores an app.use(router) that only appears in a string or comment", async () => {
    const file = write(
      "main.ts",
      `import { createApp } from "vue";

// call app.use(router); last
const hint = "app.use(router);";

async function startApp() {
  const app = createApp(RouterView);
  app.use(router);
}
`,
    );
    addModuleToMain(file, "orders");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result).toContain('const hint = "app.use(router);";');
    expect(result.match(/app\.use\(Orders\);/g)).toHaveLength(1);
    expect(result.indexOf("app.use(Orders)")).toBeGreaterThan(result.indexOf("async function startApp"));
  });

  it("throws instead of reporting a change it cannot make", () => {
    const file = write("main.ts", `import { createApp } from "vue";\n\nconst app = createApp(RouterView);\n`);
    const before = fs.readFileSync(file, "utf-8");

    expect(() => addModuleToMain(file, "orders")).toThrow(/app\.use\(router\)/);
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
  });
});

const BOOTSTRAP_TS = `import { App } from "vue";
import { addMenuItem, registerDashboardWidget } from "@vc-shell/framework";

export function bootstrap(app: App) {
  addMenuItem({
    title: "SHELL.MENU.DASHBOARD",
    icon: "lucide-home",
    priority: 0,
    url: "/",
  });

  registerDashboardWidget({
    id: "welcome-widget",
    name: "Welcome",
  });
}
`;

describe("addMenuItemToBootstrap", () => {
  it("appends after the last existing menu item", async () => {
    const file = write("bootstrap.ts", BOOTSTRAP_TS);
    addMenuItemToBootstrap(file, "reviews");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result).toContain('title: "REVIEWS.MENU.TITLE"');
    expect(result).toContain('url: "/reviews"');
    expect(result.indexOf("REVIEWS.MENU.TITLE")).toBeGreaterThan(result.indexOf("SHELL.MENU.DASHBOARD"));
  });

  it("does not splice into a menu item whose body contains `});`", async () => {
    const file = write(
      "bootstrap.ts",
      `import { App } from "vue";
import { addMenuItem } from "@vc-shell/framework";

export function bootstrap(app: App) {
  addMenuItem({
    title: "SHELL.MENU.DASHBOARD",
    url: "/",
    onClick: () => {
      track(() => { done(); });
    },
  });
}
`,
    );
    addMenuItemToBootstrap(file, "reviews");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    // The new call must sit after the whole preceding statement.
    expect(result.indexOf("REVIEWS.MENU.TITLE")).toBeGreaterThan(result.indexOf("track(() =>"));
    expect(result).toMatch(/}\);\n\n {2}addMenuItem\(\{\n {4}title: "REVIEWS\.MENU\.TITLE"/);
  });

  it("inserts into the bootstrap body when there is no menu item yet", async () => {
    const file = write(
      "bootstrap.ts",
      `import { App } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function bootstrap(app: App) {}
`,
    );
    addMenuItemToBootstrap(file, "orders");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result).toContain('import { addMenuItem } from "@vc-shell/framework";');
    expect(result).toContain('title: "ORDERS.MENU.TITLE"');
  });

  it("extends the existing framework import rather than adding a second one", async () => {
    const file = write(
      "bootstrap.ts",
      `import { App } from "vue";
import { registerDashboardWidget } from "@vc-shell/framework";

export function bootstrap(app: App) {
  registerDashboardWidget({ id: "w" });
}
`,
    );
    addMenuItemToBootstrap(file, "orders");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result).toContain('import { registerDashboardWidget, addMenuItem } from "@vc-shell/framework";');
    expect(result.match(/from "@vc-shell\/framework"/g)).toHaveLength(1);
  });

  it("is idempotent about the import across repeated runs", async () => {
    const file = write("bootstrap.ts", BOOTSTRAP_TS);
    addMenuItemToBootstrap(file, "orders");
    addMenuItemToBootstrap(file, "reviews");

    const result = fs.readFileSync(file, "utf-8");
    await expectParses(result);

    expect(result.match(/from "@vc-shell\/framework"/g)).toHaveLength(1);
    expect(result).toContain('title: "ORDERS.MENU.TITLE"');
    expect(result).toContain('title: "REVIEWS.MENU.TITLE"');
  });
});
