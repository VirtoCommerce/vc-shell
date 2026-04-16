import { describe, it, expect } from "vitest";
import { selectTransforms } from "../../src/transforms/registry";

describe("selectTransforms", () => {
  it("selects all transforms when migrating from 1.x to 2.0.0", () => {
    const selected = selectTransforms("1.0.0", "2.0.0");
    expect(selected.map((t) => t.name)).toEqual([
      "remove-release-config",
      "define-app-module",
      "use-blade-migration",
      "notification-migration",
      "rewrite-imports",
      "remove-deprecated-aliases",
      "blade-props-simplification",
      "define-expose-to-children",
      "define-options-to-blade",
      "icon-audit",
      "scss-safe-use",
      "widgets-migration",
      "composable-return-types",
      "banner-variants",
      "switch-tooltip-prop",
      "icon-container-prop",
      "menu-group-config",
      "shims-to-globals",
      "use-data-table-sort",
      "manual-migration-audit",
      "vctable-audit",
      "nswag-class-to-interface",
      "use-assets-migration",
      "replace-cover-method",
      "app-hub-rename",
      "responsive-composable",
      "use-blade-form",
      "remove-pathmatch-route",
      "locale-imports",
      "dynamic-properties-refactor",
      "window-globals",
      "remove-global-components",
    ]);
  });

  it("skips early transforms when migrating from alpha.8", () => {
    const selected = selectTransforms("2.0.0-alpha.8", "2.0.0");
    const names = selected.map((t) => t.name);
    expect(names).not.toContain("define-app-module");
    expect(names).not.toContain("use-blade-migration");
    expect(names).toContain("notification-migration");
    expect(names).toContain("rewrite-imports");
  });

  it("skips first 3 transforms when migrating from alpha.10", () => {
    const selected = selectTransforms("2.0.0-alpha.10", "2.0.0");
    const names = selected.map((t) => t.name);
    expect(names).not.toContain("define-app-module");
    expect(names).not.toContain("use-blade-migration");
    expect(names).not.toContain("notification-migration");
    expect(names).toContain("rewrite-imports");
  });

  it("returns empty when already on target version", () => {
    const selected = selectTransforms("2.1.0", "2.2.0");
    expect(selected).toEqual([]);
  });

  it("returns empty when current equals target", () => {
    const selected = selectTransforms("2.0.0", "2.0.0");
    expect(selected).toEqual([]);
  });

  it("does NOT select transforms whose introducedIn exceeds targetVersion", () => {
    // Target 1.0.0-alpha.1 — no transforms introduced before this
    const selected = selectTransforms("0.9.0", "1.0.0-alpha.1");
    expect(selected).toEqual([]);
  });

  it("selects define-app-module + all 2.0.0 stable transforms when targeting alpha.5", () => {
    const selected = selectTransforms("1.0.0", "2.0.0-alpha.5");
    const names = selected.map((t) => t.name);
    // alpha.5 includes define-app-module (introducedIn: alpha.5) PLUS all
    // transforms with introducedIn: "2.0.0" (same base version)
    expect(names).toContain("define-app-module");
    expect(names).toContain("rewrite-imports"); // introducedIn: "2.0.0"
    expect(names).not.toContain("use-blade-migration"); // introducedIn: alpha.8
  });

  it("selects alpha transforms up to target + all stable 2.0.0 transforms", () => {
    const selected = selectTransforms("1.0.0", "2.0.0-alpha.8");
    const names = selected.map((t) => t.name);
    expect(names).toContain("define-app-module"); // alpha.5
    expect(names).toContain("use-blade-migration"); // alpha.8
    expect(names).not.toContain("notification-migration"); // alpha.10
    expect(names).toContain("rewrite-imports"); // 2.0.0 (same base)
  });
});
