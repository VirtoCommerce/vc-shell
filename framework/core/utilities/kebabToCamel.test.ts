import { describe, expect, it } from "vitest";
import { kebabToCamel, kebabToPascal } from "./kebabToCamel";

describe("kebabToCamel", () => {
  it("converts kebab-case to camelCase", () => {
    expect(kebabToCamel("my-variable")).toBe("myVariable");
  });

  it("converts multiple segments", () => {
    expect(kebabToCamel("a-b-c-d")).toBe("aBCD");
  });

  it("returns single word unchanged", () => {
    expect(kebabToCamel("simple")).toBe("simple");
  });

  it("handles empty string", () => {
    expect(kebabToCamel("")).toBe("");
  });
});

describe("kebabToPascal", () => {
  it("converts kebab-case to PascalCase", () => {
    expect(kebabToPascal("my-component")).toBe("MyComponent");
  });

  it("converts single word to PascalCase", () => {
    expect(kebabToPascal("button")).toBe("Button");
  });

  it("converts multiple segments", () => {
    expect(kebabToPascal("vc-data-table")).toBe("VcDataTable");
  });
});
