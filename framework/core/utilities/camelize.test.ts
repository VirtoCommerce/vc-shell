import { describe, expect, it } from "vitest";
import { camelize } from "./camelize";

describe("camelize", () => {
  it("converts space-separated words", () => {
    expect(camelize("hello world")).toBe("helloWorld");
  });

  it("converts hyphen-separated words", () => {
    expect(camelize("my-variable-name")).toBe("myVariableName");
  });

  it("does not convert underscores (word characters)", () => {
    // \W+ regex only matches non-word chars; underscore is a word char
    expect(camelize("some_thing_here")).toBe("some_thing_here");
  });

  it("returns single word unchanged", () => {
    expect(camelize("simple")).toBe("simple");
  });

  it("handles empty string", () => {
    expect(camelize("")).toBe("");
  });
});
