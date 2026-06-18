import { describe, it, expect } from "vitest";
import { rewriteCrossDocLinks } from "../src/transformer/links.js";

describe("rewriteCrossDocLinks", () => {
  // resolveTarget: given a (sourcePath, linkHref), returns the target relative
  // path inside vc-docs if the link points to another synced doc, or null.
  const resolveTarget = (source: string, href: string): string | null => {
    const map: Record<string, Record<string, string>> = {
      "framework/ui/components/atoms/vc-button/vc-button.docs.md": {
        "../vc-link": "components/navigation/vc-link.md",
      },
    };
    return map[source]?.[href] ?? null;
  };

  it("rewrites a recognised cross-doc link to its target relative path", () => {
    const body = "See also [VcLink](../vc-link).";
    const out = rewriteCrossDocLinks(body, {
      sourcePath: "framework/ui/components/atoms/vc-button/vc-button.docs.md",
      targetPath: "components/misc/vc-button.md",
      resolveTarget,
    });
    expect(out).toContain("[VcLink](../navigation/vc-link.md)");
  });

  it("rewrites a cross-doc link with an anchor, re-appending the fragment", () => {
    const body = "See [Banner](../vc-link#banner-management).";
    const out = rewriteCrossDocLinks(body, {
      sourcePath: "framework/ui/components/atoms/vc-button/vc-button.docs.md",
      targetPath: "components/misc/vc-button.md",
      resolveTarget,
    });
    expect(out).toContain("[Banner](../navigation/vc-link.md#banner-management)");
  });

  it("leaves external links untouched", () => {
    const body = "See [Vue](https://vuejs.org).";
    const out = rewriteCrossDocLinks(body, {
      sourcePath: "framework/ui/components/atoms/vc-button/vc-button.docs.md",
      targetPath: "components/misc/vc-button.md",
      resolveTarget,
    });
    expect(out).toContain("https://vuejs.org");
  });

  it("leaves links with no resolved target untouched (warning is caller's job)", () => {
    const body = "See [Mystery](../non-synced-doc).";
    const out = rewriteCrossDocLinks(body, {
      sourcePath: "framework/ui/components/atoms/vc-button/vc-button.docs.md",
      targetPath: "components/misc/vc-button.md",
      resolveTarget,
    });
    expect(out).toContain("../non-synced-doc");
  });

  it("leaves image references alone", () => {
    const body = "![hi](./images/x.png)";
    const out = rewriteCrossDocLinks(body, {
      sourcePath: "framework/ui/components/atoms/vc-button/vc-button.docs.md",
      targetPath: "components/misc/vc-button.md",
      resolveTarget,
    });
    expect(out).toBe(body);
  });
});
