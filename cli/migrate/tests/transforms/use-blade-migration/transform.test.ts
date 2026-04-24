// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/use-blade-migration";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("use-blade-migration (jscodeshift)", () => {
  it("renames useBladeNavigation to useBlade", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBladeNavigation } from "@vc-shell/framework";\nconst { openBlade } = useBladeNavigation();`,
    });
    expect(result).toContain("useBlade");
    expect(result).not.toContain("useBladeNavigation");
  });

  it("inverts simple boolean return in onBeforeClose", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return false;
});`,
    });
    expect(result).toContain("!false");
  });

  it("inverts expression return in onBeforeClose", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return isDirty.value;
});`,
    });
    // Should negate: !isDirty.value or !(isDirty.value)
    expect(result).toMatch(/!(isDirty\.value|\(isDirty\.value\))/);
  });

  it("warns on non-inline callback", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(myCallback);`,
    });
    expect(reports[0]).toContain("non-inline callback");
  });

  it("warns on multiple returns", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  if (dirty) return true;
  return false;
});`,
    });
    expect(reports[0]).toContain("multiple returns");
  });

  it("rewrites openBlade({ blade: resolveBladeByName('X')! }) to openBlade({ name: 'X' })", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";
const { openBlade, resolveBladeByName } = useBlade();
openBlade({ blade: resolveBladeByName("OrderDetails")!, param: orderId });`,
    });
    expect(result).toContain('name: "OrderDetails"');
    expect(result).not.toContain("blade:");
    expect(result).not.toContain("resolveBladeByName");
  });

  it("removes second boolean arg from openBlade(opts, true)", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";
const { openBlade, resolveBladeByName } = useBlade();
openBlade({ blade: resolveBladeByName("MyBlade")!, param: id }, true);`,
    });
    expect(result).toContain('name: "MyBlade"');
    expect(result).not.toContain(", true");
    expect(result).not.toContain("resolveBladeByName");
  });

  it("handles resolveBladeByName without non-null assertion", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";
const { openBlade, resolveBladeByName } = useBlade();
openBlade({ blade: resolveBladeByName("Blade"), param: id });`,
    });
    expect(result).toContain('name: "Blade"');
    expect(result).not.toContain("resolveBladeByName");
  });

  it("triggers on resolveBladeByName even when useBladeNavigation is already renamed", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";
const { openBlade, resolveBladeByName } = useBlade();
openBlade({ blade: resolveBladeByName("X")!, param: id });`,
    });
    expect(result).not.toBeNull();
    expect(result).toContain('name: "X"');
  });

  it("skips files without useBladeNavigation or resolveBladeByName", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";`,
    });
    expect(result).toBeNull();
  });
});
