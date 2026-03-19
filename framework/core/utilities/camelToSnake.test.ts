import { describe, expect, it } from "vitest";
import { camelToSnake } from "./camelToSnake";

describe("camelToSnake", () => {
  it("converts simple camelCase", () => {
    expect(camelToSnake("camelCase")).toBe("camel_case");
  });

  it("converts multiple humps", () => {
    expect(camelToSnake("myVariableName")).toBe("my_variable_name");
  });

  it("returns lowercase single word unchanged", () => {
    expect(camelToSnake("simple")).toBe("simple");
  });

  it("handles empty string", () => {
    expect(camelToSnake("")).toBe("");
  });

  it("handles single character", () => {
    expect(camelToSnake("a")).toBe("a");
  });
});
