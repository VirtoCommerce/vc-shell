// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/locale-imports";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("locale-imports", () => {
  it("rewrites framework dist locale import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "@vc-shell/framework/dist/locales/en.json";`,
    });
    expect(result).toContain(`from "@vc-shell/framework/locales/en"`);
    expect(result).not.toContain("dist/locales");
    expect(result).not.toContain(".json");
  });

  it("handles other locale names", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import de from "@vc-shell/framework/dist/locales/de.json";`,
    });
    expect(result).toContain(`from "@vc-shell/framework/locales/de"`);
  });

  it("skips non-framework locale imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "./locales/en.json";`,
    });
    expect(result).toBeNull();
  });

  it("skips already-migrated imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "@vc-shell/framework/locales/en";`,
    });
    expect(result).toBeNull();
  });
});
