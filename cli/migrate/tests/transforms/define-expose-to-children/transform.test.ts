// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/define-expose-to-children";
import { defineFixtureTest } from "../../../src/utils/test-helpers";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("define-expose-to-children", () => {
  it("adds useBlade import when framework import does not yet exist", () => {
    // Regression: previously this case silently skipped the import, leaving
    // an unresolved useBlade() reference in the output (TS2304).
    const { result, expected } = defineFixtureTest(transform, FIXTURES, "no-framework-import", "vue");
    expect(result).toContain(`import { useBlade } from "@vc-shell/framework"`);
    expect(result).toContain("useBlade()");
    expect(result).toContain("exposeToChildren");
    // Ensure we didn't keep defineExpose around
    expect(result).not.toContain("defineExpose");
    // Sanity: expected fixture file is readable
    expect(expected).toBeTruthy();
  });
});
