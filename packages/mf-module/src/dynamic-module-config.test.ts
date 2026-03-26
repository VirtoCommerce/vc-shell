import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@module-federation/vite", () => ({
  federation: vi.fn((config: any) => ({ name: "mf-plugin", _config: config })),
}));

vi.mock("@vitejs/plugin-vue", () => ({
  default: vi.fn(() => ({ name: "vue-plugin" })),
}));

import dynamicModuleConfiguration from "./dynamic-module-config";
import { SHARED_DEP_NAMES } from "@vc-shell/mf-config";

describe("dynamicModuleConfiguration (MF)", () => {
  const pkg = { name: "reviews", version: "1.0.0" };

  beforeEach(() => {
    delete process.env.APP_BASE_PATH;
  });

  it("derives base from package name by default", () => {
    const config = dynamicModuleConfiguration(pkg, {
      compatibility: { framework: "^2.0.0" },
    });
    expect(config.base).toBe("/apps/reviews/");
  });

  it("uses APP_BASE_PATH env var when set", () => {
    process.env.APP_BASE_PATH = "/custom/path/";
    const config = dynamicModuleConfiguration(pkg, {
      compatibility: { framework: "^2.0.0" },
    });
    expect(config.base).toBe("/custom/path/");
  });

  it("produces MF remote config with correct name and exposes", () => {
    const config = dynamicModuleConfiguration(pkg, {
      compatibility: { framework: "^2.0.0" },
    });

    expect(config.plugins).toBeDefined();
    const mfPlugin = (config.plugins as any[]).find((p: any) => p._config);
    expect(mfPlugin._config.name).toBe("reviews");
    expect(mfPlugin._config.filename).toBe("remoteEntry.js");
    expect(mfPlugin._config.exposes["./module"]).toBe("./src/modules/index.ts");
  });

  it("uses custom entry point when provided", () => {
    const config = dynamicModuleConfiguration(pkg, {
      entry: "./src/custom.ts",
      compatibility: { framework: "^2.0.0" },
    });

    const mfPlugin = (config.plugins as any[]).find((p: any) => p._config);
    expect(mfPlugin._config.exposes["./module"]).toBe("./src/custom.ts");
  });

  it("sets build target to esnext", () => {
    const config = dynamicModuleConfiguration(pkg, {
      compatibility: { framework: "^2.0.0" },
    });
    expect(config.build?.target).toBe("esnext");
  });

  it("includes shared deps with singleton: true", () => {
    const config = dynamicModuleConfiguration(pkg, {
      compatibility: { framework: "^2.0.0" },
    });
    const mfPlugin = (config.plugins as any[]).find((p: any) => p._config);
    expect(mfPlugin._config.shared.vue.singleton).toBe(true);
    expect(mfPlugin._config.shared["@vc-shell/framework"].singleton).toBe(true);
  });

  it("stripExternalStyles plugin has buildStart hook for path normalization", () => {
    const config = dynamicModuleConfiguration({ name: "test-module", version: "1.0.0" }, {});
    const stripPlugin = config.plugins?.flat().find((p: any) => p?.name === "strip-external-styles");
    expect(stripPlugin).toBeDefined();
    expect(typeof (stripPlugin as any).buildStart).toBe("function");
    expect(typeof (stripPlugin as any).transform).toBe("function");
  });

  it("uses custom exposes when provided", () => {
    const config = dynamicModuleConfiguration(pkg, {
      exposes: { "./custom": "./src/custom.ts" },
      compatibility: { framework: "^2.0.0" },
    });
    const mfPlugin = (config.plugins as any[]).find((p: any) => p._config);
    expect(mfPlugin._config.exposes["./custom"]).toBe("./src/custom.ts");
    expect(mfPlugin._config.exposes["./module"]).toBeUndefined();
  });
});

describe("stripExternalStyles transform", () => {
  let stripPlugin: any;

  beforeEach(() => {
    const config = dynamicModuleConfiguration({ name: "test-module", version: "1.0.0" }, {});
    stripPlugin = config.plugins?.flat().find((p: any) => p?.name === "strip-external-styles");
    stripPlugin.buildStart.call({});
  });

  it("strips CSS from shared dep in node_modules", () => {
    const result = stripPlugin.transform(
      "body{}",
      `${process.cwd()}/node_modules/@vc-shell/framework/assets/styles/index.css`,
    );
    expect(result).toEqual({ code: "", map: null });
  });

  it("strips Vue SFC style from shared dep in node_modules", () => {
    const result = stripPlugin.transform(
      ".comp{}",
      `${process.cwd()}/node_modules/@vc-shell/framework/ui/Component.vue?type=style&index=0`,
    );
    expect(result).toEqual({ code: "", map: null });
  });

  it("strips SCSS from scoped shared dep", () => {
    const result = stripPlugin.transform(
      "$var: red;",
      `${process.cwd()}/node_modules/@vc-shell/framework/assets/theme.scss`,
    );
    expect(result).toEqual({ code: "", map: null });
  });

  it("strips CSS from non-scoped shared dep (e.g. vue-i18n)", () => {
    const result = stripPlugin.transform("div{}", `${process.cwd()}/node_modules/vue-i18n/dist/style.css`);
    expect(result).toEqual({ code: "", map: null });
  });

  it("keeps CSS from non-shared npm package", () => {
    const result = stripPlugin.transform(".picker{}", `${process.cwd()}/node_modules/some-datepicker/dist/style.css`);
    expect(result).toBeNull();
  });

  it("keeps module's own CSS in src/", () => {
    const result = stripPlugin.transform(".my{}", `${process.cwd()}/src/components/MyComponent.scss`);
    expect(result).toBeNull();
  });

  it("keeps module's own Vue SFC style", () => {
    const result = stripPlugin.transform(".my{}", `${process.cwd()}/src/components/MyComponent.vue?type=style&index=0`);
    expect(result).toBeNull();
  });

  it("strips CSS from path outside project root (symlink/portal scenario)", () => {
    const result = stripPlugin.transform(".ext{}", `/some/other/project/node_modules/some-private-pkg/dist/style.css`);
    expect(result).toEqual({ code: "", map: null });
  });

  it("keeps Vue SFC style from non-shared dep in node_modules", () => {
    const result = stripPlugin.transform(
      ".picker{}",
      `${process.cwd()}/node_modules/some-datepicker/SomeComponent.vue?type=style&index=0`,
    );
    expect(result).toBeNull();
  });

  it("returns null for non-style files", () => {
    const result = stripPlugin.transform(
      "export default {}",
      `${process.cwd()}/node_modules/@vc-shell/framework/index.ts`,
    );
    expect(result).toBeNull();
  });

  it("strips all shared deps from SHARED_DEP_NAMES", () => {
    expect(SHARED_DEP_NAMES.length).toBeGreaterThan(0);
    for (const dep of SHARED_DEP_NAMES) {
      const result = stripPlugin.transform("body{}", `${process.cwd()}/node_modules/${dep}/dist/style.css`);
      expect(result).toEqual({ code: "", map: null });
    }
  });
});
