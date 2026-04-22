// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/replace-cover-method";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("replace-cover-method", () => {
  it("replaces openBlade with replaceCurrentBlade: true → coverWith", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { openBlade } = useBlade();
openBlade({ name: "Details", param: id, replaceCurrentBlade: true });`,
    });
    expect(result).toContain("coverWith");
    expect(result).not.toContain("replaceCurrentBlade");
    expect(result).not.toContain("openBlade");
  });

  it("adds coverWith to useBlade destructuring", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { openBlade, closeSelf } = useBlade();
openBlade({ name: "Details", replaceCurrentBlade: true });`,
    });
    expect(result).toContain("coverWith");
    expect(result).toContain("closeSelf");
    expect(result).not.toContain("openBlade");
  });

  it("keeps openBlade in destructuring if still used elsewhere", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { openBlade } = useBlade();
openBlade({ name: "Details", replaceCurrentBlade: true });
openBlade({ name: "Other" });`,
    });
    expect(result).toContain("coverWith");
    expect(result).toContain("openBlade");
  });

  it("skips openBlade without replaceCurrentBlade", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { openBlade } = useBlade();
openBlade({ name: "Details", param: id });`,
    });
    expect(result).toBeNull();
  });

  it("does not touch existing replaceWith calls", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { replaceWith } = useBlade();
replaceWith({ name: "Details", param: id });`,
    });
    expect(result).toBeNull();
  });

  it("skips replaceCurrentBlade: false", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `const { openBlade } = useBlade();
openBlade({ name: "Details", replaceCurrentBlade: false });`,
    });
    expect(result).toBeNull();
  });
});
