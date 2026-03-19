import { describe, expect, it } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("returns a 7-character string", () => {
    expect(generateId()).toHaveLength(7);
  });

  it("returns only alphanumeric characters", () => {
    expect(generateId()).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
