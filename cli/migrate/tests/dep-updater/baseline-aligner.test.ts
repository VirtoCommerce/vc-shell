import { describe, it, expect, vi } from "vitest";
import { applyBaselineVersions } from "../../src/dep-updater";

vi.mock("../../src/baseline-versions", () => ({
  BASELINE_VERSIONS: {
    eslint: "^9.35.0",
    vite: "^6.3.3",
    "@vueuse/core": "^10.7.1",
  },
}));

describe("applyBaselineVersions", () => {
  it("updates a dependency whose version differs from baseline", () => {
    const pkg = { dependencies: {}, devDependencies: { eslint: "^8.0.0" } };
    const changes = applyBaselineVersions(pkg);
    expect(pkg.devDependencies.eslint).toBe("^9.35.0");
    expect(changes).toEqual(["eslint: ^8.0.0 → ^9.35.0"]);
  });

  it("does nothing when the version already matches baseline", () => {
    const pkg = { dependencies: {}, devDependencies: { vite: "^6.3.3" } };
    const changes = applyBaselineVersions(pkg);
    expect(pkg.devDependencies.vite).toBe("^6.3.3");
    expect(changes).toEqual([]);
  });

  it("ignores a dependency that is not in the baseline", () => {
    const pkg = { dependencies: {}, devDependencies: { moment: "^2.30.1" } };
    const changes = applyBaselineVersions(pkg);
    expect(pkg.devDependencies.moment).toBe("^2.30.1");
    expect(changes).toEqual([]);
  });

  it("does not add packages from baseline that are absent in target", () => {
    const pkg = { dependencies: {}, devDependencies: { moment: "^2.30.1" } };
    applyBaselineVersions(pkg);
    expect(pkg.devDependencies).not.toHaveProperty("eslint");
    expect(pkg.devDependencies).not.toHaveProperty("vite");
  });

  it("skips @vc-shell/* keys even if they appear in baseline", () => {
    const pkg = { dependencies: { "@vc-shell/framework": "^1.0.0" }, devDependencies: {} };
    const changes = applyBaselineVersions(pkg);
    expect(pkg.dependencies["@vc-shell/framework"]).toBe("^1.0.0");
    expect(changes).toEqual([]);
  });

  it("processes both dependencies and devDependencies", () => {
    const pkg = {
      dependencies: { "@vueuse/core": "^9.0.0" },
      devDependencies: { eslint: "^8.0.0" },
    };
    const changes = applyBaselineVersions(pkg);
    expect(pkg.dependencies["@vueuse/core"]).toBe("^10.7.1");
    expect(pkg.devDependencies.eslint).toBe("^9.35.0");
    expect(changes).toHaveLength(2);
  });

  it("tolerates missing dependencies or devDependencies fields", () => {
    const pkg1 = { devDependencies: { eslint: "^8.0.0" } };
    expect(() => applyBaselineVersions(pkg1)).not.toThrow();

    const pkg2 = { dependencies: { eslint: "^8.0.0" } };
    expect(() => applyBaselineVersions(pkg2)).not.toThrow();

    const pkg3 = {};
    expect(() => applyBaselineVersions(pkg3)).not.toThrow();
  });

  it("preserves untouched fields (resolutions, packageManager)", () => {
    const pkg = {
      dependencies: { eslint: "^8.0.0" },
      devDependencies: {},
      resolutions: { "conventional-changelog-angular": "^8.3.0" },
      packageManager: "yarn@4.9.1",
    };
    applyBaselineVersions(pkg);
    expect(pkg.resolutions).toEqual({ "conventional-changelog-angular": "^8.3.0" });
    expect(pkg.packageManager).toBe("yarn@4.9.1");
  });
});
