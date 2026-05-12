import { describe, it, expect } from "vitest";
import { formatReport } from "../src/report/formatter.js";

describe("formatReport", () => {
  it("renders all sections in markdown", () => {
    const md = formatReport({
      vcShellVersion: "v2.1.0",
      timestamp: "2026-04-28T10:00:00Z",
      changes: [
        { source: "framework/x.docs.md", target: "components/misc/x.md", kind: "created" },
        { source: "framework/y.docs.md", target: "components/misc/y.md", kind: "updated" },
        { source: "framework/z.docs.md", target: "components/misc/z.md", kind: "unchanged" },
      ],
      skipped: [{ source: "framework/_internal.docs.md", reason: "internal" }],
      orphans: [{ target: "components/misc/old.md" }],
      errors: [],
    });
    expect(md).toContain("vc-shell@v2.1.0");
    expect(md).toContain("Created: 1");
    expect(md).toContain("Updated: 1");
    expect(md).toContain("Unchanged: 1");
    expect(md).toContain("Orphaned: 1");
    expect(md).toContain("components/misc/old.md");
  });

  it("notes when there are zero errors", () => {
    const md = formatReport({
      vcShellVersion: "v0",
      timestamp: "now",
      changes: [],
      skipped: [],
      orphans: [],
      errors: [],
    });
    expect(md).toContain("(none)");
  });
});
