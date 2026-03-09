import { describe, it, expect, vi } from "vitest";
import { SHARED_DEP_NAMES } from "./shared-deps";

vi.mock("@module-federation/vite", () => ({
  federation: vi.fn((config: unknown) => ({ name: "mf-plugin", _config: config })),
}));

import { getHostFederationConfig } from "./vite.host.appconfig";

it("SHARED_DEP_NAMES matches SHARED_DEPS_BASE keys", () => {
  expect(SHARED_DEP_NAMES).toEqual(
    expect.arrayContaining([
      "vue", "vue-router", "vue-i18n", "vee-validate",
      "lodash-es", "@vueuse/core", "@vc-shell/framework",
    ])
  );
  expect(SHARED_DEP_NAMES.length).toBe(7);
});

describe("getHostFederationConfig", () => {
  it("returns config with MF plugin containing default shared deps", () => {
    const config = getHostFederationConfig();

    expect(config.plugins).toBeDefined();
    expect(config.plugins).toHaveLength(1);

    const plugin = config.plugins![0] as { name: string; _config: Record<string, unknown> };
    expect(plugin.name).toBe("mf-plugin");

    const mfConfig = plugin._config;
    expect(mfConfig.name).toBe("host");
    expect(mfConfig.remotes).toEqual({});

    const shared = mfConfig.shared as Record<string, { singleton?: boolean }>;
    expect(shared.vue).toEqual({ singleton: true, requiredVersion: "^3.4.0" });
    expect(shared["vue-router"]).toEqual({ singleton: true, requiredVersion: "^4.0.0" });
    expect(shared["vue-i18n"]).toEqual({ singleton: true, requiredVersion: "^9.0.0" });
    expect(shared["@vc-shell/framework"]).toEqual({ singleton: true });
    expect(shared["vee-validate"]).toEqual({ singleton: true });
    expect(shared["lodash-es"]).toEqual({ singleton: true });
    expect(shared["@vueuse/core"]).toEqual({ singleton: true });
  });

  it("merges custom sharedDeps while keeping defaults", () => {
    const config = getHostFederationConfig({
      sharedDeps: {
        "my-lib": { singleton: true, requiredVersion: "^2.0.0" },
        vue: { singleton: true, requiredVersion: "^3.5.0", eager: true },
      },
    });

    const plugin = config.plugins![0] as { name: string; _config: Record<string, unknown> };
    const shared = plugin._config.shared as Record<string, { singleton?: boolean; requiredVersion?: string; eager?: boolean }>;

    // Custom dep added
    expect(shared["my-lib"]).toEqual({ singleton: true, requiredVersion: "^2.0.0" });

    // Vue overridden by custom
    expect(shared.vue).toEqual({ singleton: true, requiredVersion: "^3.5.0", eager: true });

    // Other defaults preserved
    expect(shared["vue-router"]).toEqual({ singleton: true, requiredVersion: "^4.0.0" });
    expect(shared["@vc-shell/framework"]).toEqual({ singleton: true });
  });
});
