// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/remove-deprecated-aliases";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("remove-deprecated-aliases (jscodeshift)", () => {
  it("renames TOOLBAR_SERVICE to ToolbarServiceKey", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { TOOLBAR_SERVICE } from "@vc-shell/framework";\nconst svc = inject(TOOLBAR_SERVICE);`,
    });
    expect(result).toContain("ToolbarServiceKey");
    expect(result).not.toContain("TOOLBAR_SERVICE");
  });

  it("emits diagnostic for BladeInstance (requires manual migration)", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { BladeInstance } from "@vc-shell/framework";\nconst blade = inject(BladeInstance);`,
    });
    // BladeInstance is no longer mechanically renamed — it needs manual migration to useBlade()
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("useBlade()");
  });

  it("renames multiple aliases in one file", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { EMBEDDED_MODE, BLADE_BACK_BUTTON } from "@vc-shell/framework";
const embedded = inject(EMBEDDED_MODE);
const back = inject(BLADE_BACK_BUTTON);`,
    });
    expect(result).toContain("EmbeddedModeKey");
    expect(result).toContain("BladeBackButtonKey");
    expect(result).not.toContain("EMBEDDED_MODE");
    expect(result).not.toContain("BLADE_BACK_BUTTON");
  });

  it("skips files without @vc-shell/framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("renames NotificationTemplatesSymbol to NotificationTemplatesKey", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { NotificationTemplatesSymbol } from "@vc-shell/framework";\nconst tpl = inject(NotificationTemplatesSymbol);`,
    });
    expect(result).toContain("NotificationTemplatesKey");
    expect(result).not.toContain("NotificationTemplatesSymbol");
  });

  it("skips files without matching imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst b = useBlade();`,
    });
    expect(result).toBeNull();
  });
});
