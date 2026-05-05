import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocFile } from "../src/parser/parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(__dirname, "fixtures");

describe("parseDocFile", () => {
  it("parses a simple component doc", async () => {
    const result = await parseDocFile(path.join(fixtures, "simple-component.docs.md"));
    expect(result.frontmatter.title).toBe("VcButton");
    expect(result.frontmatter.category).toBe("components");
    expect(result.frontmatter.group).toBe("misc");
    expect(result.body).toContain("# VcButton");
    expect(result.body).not.toContain("---\ntitle:");
  });

  it("extracts relative image references", async () => {
    const result = await parseDocFile(path.join(fixtures, "simple-component.docs.md"));
    expect(result.imageRefs).toEqual(["./images/default.png", "./images/hover.png"]);
  });

  it("preserves internal blocks in body (transformer strips them later)", async () => {
    const result = await parseDocFile(path.join(fixtures, "composable-with-internal.docs.md"));
    expect(result.body).toContain("<!-- internal:start -->");
    expect(result.body).toContain("<!-- internal:end -->");
  });
});
