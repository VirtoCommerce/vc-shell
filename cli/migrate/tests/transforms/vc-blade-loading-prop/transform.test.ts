import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/vc-blade-loading-prop";
import { defineFixtureTest, applyTransform } from "../../../src/utils/test-helpers";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("vc-blade-loading-prop", () => {
  it("converts multi-line <VcBlade v-loading> to :loading; leaves inner v-loading alone", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "details-blade", "vue");
    expect(match).toBe(true);
  });

  it("works on single-line <VcBlade> tag", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "inline-blade", "vue");
    expect(match).toBe(true);
  });

  it("removes unused vLoading specifier from @vc-shell/framework/ui import after rewrite", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "cleanup-import", "vue");
    expect(match).toBe(true);
  });

  it("does not touch files where VcBlade already uses :loading", () => {
    const inputPath = join(FIXTURES, "no-loading.input.vue");
    const input = readFileSync(inputPath, "utf8");
    const result = applyTransform(transform, { path: inputPath, source: input });
    expect(result).toBeNull();
  });
});
