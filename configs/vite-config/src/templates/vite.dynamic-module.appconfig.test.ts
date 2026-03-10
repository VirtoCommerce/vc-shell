import { describe, it, expect, vi } from "vitest";

vi.mock("@module-federation/vite", () => ({
  federation: vi.fn((config: any) => ({ name: "mf-plugin", _config: config })),
}));

vi.mock("@vitejs/plugin-vue", () => ({
  default: vi.fn(() => ({ name: "vue-plugin" })),
}));

import dynamicModuleConfiguration from "./vite.dynamic-module.appconfig";

describe("dynamicModuleConfiguration (MF)", () => {
  const pkg = { name: "reviews", version: "1.0.0" };

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
    const config = dynamicModuleConfiguration(
      { name: "test-module", version: "1.0.0" },
      {},
    );
    const stripPlugin = config.plugins?.flat().find(
      (p: any) => p?.name === "strip-external-styles",
    );
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
