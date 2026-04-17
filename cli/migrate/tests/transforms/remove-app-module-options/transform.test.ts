import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/remove-app-module-options";
import { defineFixtureTest, applyTransform } from "../../../src/utils/test-helpers";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("remove-app-module-options", () => {
  it("strips `{ router }` second argument from .use(AppModule, { router })", () => {
    const { match } = defineFixtureTest(transform, FIXTURES, "basic", "ts");
    expect(match).toBe(true);
  });

  it("does not touch .use(Framework, { router, i18n, ... }) with multi-key options", () => {
    const inputPath = join(FIXTURES, "no-match.input.ts");
    const input = readFileSync(inputPath, "utf8");
    const result = applyTransform(transform, { path: inputPath, source: input });
    expect(result).toBeNull();
  });
});
