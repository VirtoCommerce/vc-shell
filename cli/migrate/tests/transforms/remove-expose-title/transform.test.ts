// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/remove-expose-title";
import { defineFixtureTest, applyTransform } from "../../../src/utils/test-helpers";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("remove-expose-title", () => {
  it("removes entire exposeToChildren({title}) call when title is the only key", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "title-only", "vue");
    expect(match).toBe(true);
  });

  it("strips only `title` when other keys remain", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "title-with-others", "vue");
    expect(match).toBe(true);
  });

  it("leaves files without a title key unchanged", () => {
    const input = readFileSync(join(FIXTURES, "no-title.input.vue"), "utf8");
    const result = applyTransform(transform, { path: join(FIXTURES, "no-title.input.vue"), source: input });
    expect(result).toBeNull();
  });
});
