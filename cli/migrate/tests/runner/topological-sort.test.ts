// @vitest-environment node
import { describe, it, expect } from "vitest";
import { topologicalSort } from "../../src/runner";
import type { VersionedTransform } from "../../src/transforms/types";

function stub(name: string, after?: string[]): VersionedTransform {
  return { name, description: "", introducedIn: "2.0.0", transformPath: "", after };
}

describe("topologicalSort", () => {
  it("preserves order when no dependencies", () => {
    const input = [stub("a"), stub("b"), stub("c")];
    const result = topologicalSort(input);
    expect(result.map((t) => t.name)).toEqual(["a", "b", "c"]);
  });

  it("reorders based on after dependency", () => {
    const input = [stub("blade-props", ["define-options"]), stub("define-options"), stub("other")];
    const result = topologicalSort(input);
    const names = result.map((t) => t.name);
    expect(names.indexOf("define-options")).toBeLessThan(names.indexOf("blade-props"));
  });

  it("handles transitive dependencies", () => {
    const input = [stub("c", ["b"]), stub("b", ["a"]), stub("a")];
    const result = topologicalSort(input);
    expect(result.map((t) => t.name)).toEqual(["a", "b", "c"]);
  });

  it("preserves relative order of unrelated transforms", () => {
    const input = [stub("x"), stub("c", ["a"]), stub("y"), stub("a")];
    const result = topologicalSort(input);
    const names = result.map((t) => t.name);
    expect(names.indexOf("a")).toBeLessThan(names.indexOf("c"));
    expect(names.indexOf("x")).toBeLessThan(names.indexOf("y"));
  });

  it("throws on cycle", () => {
    const input = [stub("a", ["b"]), stub("b", ["a"])];
    expect(() => topologicalSort(input)).toThrow(/cycle/i);
  });

  it("ignores after references to transforms not in the selected set", () => {
    const input = [stub("b", ["not-selected"]), stub("a")];
    const result = topologicalSort(input);
    expect(result).toHaveLength(2);
  });
});
