// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/responsive-composable";
import { defineFixtureTest } from "../../../src/utils/test-helpers";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("responsive-composable", () => {
  it("replaces $isMobile.value/$isDesktop.value in template and adds useResponsive", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "template-global-props", "vue");
    expect(match).toBe(true);
  });

  it("replaces inject(IsMobileKey) with useResponsive destructure", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "script-inject-symbol", "vue");
    expect(match).toBe(true);
  });

  it("replaces inject('isMobile') string keys with useResponsive destructure", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "script-inject-string", "vue");
    expect(match).toBe(true);
  });

  it("skips files without responsive usage", () => {
    const { result } = defineFixtureTest(transform, FIXTURES, "no-responsive", "vue");
    expect(result).toBeNull();
  });

  it("handles mixed template + script responsive patterns", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "mixed", "vue");
    expect(match).toBe(true);
  });
});
