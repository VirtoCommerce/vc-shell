import { describe, it, expect } from "vitest";
import { selectTransforms } from "../../src/transforms/registry";

describe("selectTransforms", () => {
  it("selects all transforms when migrating from 1.x to 2.0.0", () => {
    const selected = selectTransforms("1.0.0", "2.0.0");
    expect(selected.map((t) => t.name)).toEqual([
      "define-app-module",
      "use-blade-migration",
      "notification-migration",
      "rewrite-imports",
      "remove-deprecated-aliases",
      "blade-props-simplification",
      "icon-audit",
      "scss-safe-use",
      "widgets-migration",
      "composable-return-types",
      "banner-variants",
      "switch-tooltip-prop",
      "icon-container-prop",
      "menu-group-config",
      "shims-to-globals",
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
    const selected = selectTransforms("2.0.0", "2.1.0");
    expect(selected).toEqual([]);
  });

  it("returns empty when current equals target", () => {
    const selected = selectTransforms("2.0.0", "2.0.0");
    expect(selected).toEqual([]);
  });

  it("does NOT select transforms whose introducedIn exceeds targetVersion", () => {
    const selected = selectTransforms("1.0.0", "2.0.0-alpha.4");
    expect(selected).toEqual([]);
  });

  it("selects define-app-module when targeting exactly alpha.5", () => {
    const selected = selectTransforms("1.0.0", "2.0.0-alpha.5");
    const names = selected.map((t) => t.name);
    expect(names).toEqual(["define-app-module"]);
  });

  it("selects transforms up to but not exceeding target alpha.8", () => {
    const selected = selectTransforms("1.0.0", "2.0.0-alpha.8");
    const names = selected.map((t) => t.name);
    expect(names).toContain("define-app-module");
    expect(names).toContain("use-blade-migration");
    expect(names).not.toContain("notification-migration");
    expect(names).not.toContain("rewrite-imports");
  });
});
