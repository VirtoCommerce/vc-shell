// @vitest-environment node
import { describe, it, expect } from "vitest";
import jscodeshift from "jscodeshift";
import { deduplicateImportSpecifiers } from "../../src/utils/import-dedup";

const j = jscodeshift.withParser("tsx");

describe("deduplicateImportSpecifiers", () => {
  it("removes duplicate specifiers within one import declaration", () => {
    const input = `import { useBlade, usePopup, useBlade } from "@vc-shell/framework";`;
    const result = deduplicateImportSpecifiers(input, j);
    expect(result).toContain("useBlade");
    expect(result).toContain("usePopup");
    const matches = result.match(/useBlade/g);
    expect(matches).toHaveLength(1);
  });

  it("merges duplicate import declarations from same source", () => {
    const input = `import { useBlade } from "@vc-shell/framework";
import { usePopup, useBlade } from "@vc-shell/framework";`;
    const result = deduplicateImportSpecifiers(input, j);
    const importMatches = result.match(/from "@vc-shell\/framework"/g);
    expect(importMatches).toHaveLength(1);
    expect(result).toContain("useBlade");
    expect(result).toContain("usePopup");
    const useBladeMatches = result.match(/useBlade/g);
    expect(useBladeMatches).toHaveLength(1);
  });

  it("preserves default and namespace imports", () => {
    const input = `import myDefault, { foo, foo } from "mod";`;
    const result = deduplicateImportSpecifiers(input, j);
    expect(result).toContain("myDefault");
    const fooMatches = result.match(/\bfoo\b/g);
    expect(fooMatches).toHaveLength(1);
  });

  it("returns unchanged source when no duplicates", () => {
    const input = `import { a, b, c } from "mod";`;
    const result = deduplicateImportSpecifiers(input, j);
    expect(result).toBe(input);
  });

  it("handles imports from different sources independently", () => {
    const input = `import { foo } from "a";
import { foo } from "b";`;
    const result = deduplicateImportSpecifiers(input, j);
    expect(result.match(/from "a"/g)).toHaveLength(1);
    expect(result.match(/from "b"/g)).toHaveLength(1);
  });
});
