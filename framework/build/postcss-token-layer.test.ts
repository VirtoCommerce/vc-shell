import { describe, expect, it } from "vitest";
import postcss from "postcss";
const tokenLayer = require("./postcss-token-layer.cjs");

const run = async (css: string) => (await postcss([tokenLayer()]).process(css, { from: undefined })).css;

describe("postcss-token-layer", () => {
  it("puts a :root token rule in the vc-shell layer", async () => {
    expect((await run(":root { --status-bg: red; }")).replace(/\s+/g, " ")).toBe(
      "@layer vc-shell { :root { --status-bg: red; } }",
    );
  });

  it("layers theme token rules too, so they keep beating the defaults inside the layer", async () => {
    expect(await run(':root[data-theme="dark"] { --x: 1; }')).toContain("@layer vc-shell");
  });

  it("leaves rules that are not pure token declarations", async () => {
    const css = [
      ":root { --x: 1; color: red; }",
      ":root .vc-status { --x: 1; }",
      ':root, [dir="ltr"] { --vc-inline-sign: 1; }',
      ".vc-status { --x: 1; }",
      "@media (min-width: 1px) { :root { --x: 1; } }",
    ].join("\n");
    expect(await run(css)).toBe(css);
  });
});
