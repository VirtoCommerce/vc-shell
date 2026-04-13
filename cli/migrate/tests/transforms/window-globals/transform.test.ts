import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/window-globals";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("window-globals (diagnostic)", () => {
  it("reports window._ usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const items = window._.uniq(list);`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("window._");
  });

  it("reports window.Vue usage", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const app = window.Vue.createApp({});`,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("window.Vue");
  });

  it("reports window.moment usage", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const date = window.moment().format("LLL");`,
    });
    expect(reports.length).toBeGreaterThan(0);
  });

  it("skips files without window globals", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(reports).toHaveLength(0);
  });
});
