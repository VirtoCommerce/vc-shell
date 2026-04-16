import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/remove-global-components";
import { defineFixtureTest } from "../../../src/utils/test-helpers";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("remove-global-components", () => {
  it("skips files without Vc* component usage", () => {
    const { result } = defineFixtureTest(transform, FIXTURES, "no-components", "vue");
    expect(result).toBeNull();
  });

  it("adds imports for components used in template without imports", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "basic-components", "vue");
    expect(match).toBe(true);
  });

  it("splits mixed imports: moves UI to /ui, keeps composables in main", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "split-imports", "vue");
    expect(match).toBe(true);
  });

  it("adds directive imports for v-loading", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "directives", "vue");
    expect(match).toBe(true);
  });

  it("handles kebab-case component tags (vc-button -> VcButton)", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "kebab-case", "vue");
    expect(match).toBe(true);
  });

  it("rewrites all-UI import from @vc-shell/framework to /ui", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "rewrite-all-ui", "vue");
    expect(match).toBe(true);
  });
});
