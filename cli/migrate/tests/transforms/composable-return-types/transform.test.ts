import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/composable-return-types";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("composable-return-types (jscodeshift)", () => {
  it("renames IUsePermissions to UsePermissionsReturn", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import type { IUsePermissions } from "@vc-shell/framework";\nconst x: IUsePermissions = getPerms();`,
    });
    expect(result).toContain("UsePermissionsReturn");
    expect(result).not.toContain("IUsePermissions");
  });

  it("renames multiple types in one file", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import type { IAppUserAPI, IUseTheme, AccordionProps } from "@vc-shell/framework";
const user: IAppUserAPI = getUser();
const theme: IUseTheme = getTheme();
const props: AccordionProps = getProps();`,
    });
    expect(result).toContain("UseUserReturn");
    expect(result).toContain("UseThemeReturn");
    expect(result).toContain("VcAccordionProps");
    expect(result).not.toContain("IAppUserAPI");
    expect(result).not.toContain("IUseTheme");
    // "AccordionProps" is a substring of "VcAccordionProps", so check no standalone occurrence
    expect(result!.replace(/VcAccordionProps/g, "")).not.toContain("AccordionProps");
  });

  it("renames AccordionEmits to VcAccordionEmits", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import type { AccordionEmits } from "@vc-shell/framework";\ntype MyEmits = AccordionEmits;`,
    });
    expect(result).toContain("VcAccordionEmits");
    expect(result!.replace(/VcAccordionEmits/g, "")).not.toContain("AccordionEmits");
  });

  it("skips files without @vc-shell/framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("skips files without matching type imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst b = useBlade();`,
    });
    expect(result).toBeNull();
  });
});
