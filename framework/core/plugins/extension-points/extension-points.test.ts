import { describe, it, expect } from "vitest";
import { ExtensionPoints } from "./index";
import type { ExtensionPointName } from "./index";

describe("ExtensionPoints", () => {
  it("ExtensionPoints.AUTH_AFTER_FORM equals the canonical string value", () => {
    expect(ExtensionPoints.AUTH_AFTER_FORM).toBe("auth:after-form");
  });

  it("Object.keys returns exactly ['AUTH_AFTER_FORM']", () => {
    expect(Object.keys(ExtensionPoints)).toEqual(["AUTH_AFTER_FORM"]);
  });

  it("ExtensionPointName type accepts ExtensionPoints values (compile-time assertion)", () => {
    // If this compiles, ExtensionPointName correctly types the const values.
    const name: ExtensionPointName = ExtensionPoints.AUTH_AFTER_FORM;
    expect(name).toBe("auth:after-form");
  });
});
