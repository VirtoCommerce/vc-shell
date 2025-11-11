import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Component Registry", () => {
  const registryPath = path.join(__dirname, "../schemas/component-registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

  describe("Required components exist", () => {
    const requiredComponents = [
      "VcBlade",
      "VcTable", 
      "VcForm",
      "VcInput",
      "VcTextarea",
      "VcSelect",
      "VcCheckbox",
      "VcSwitch",
      "VcButton",
      "VcCard",
      "VcContainer",
      "VcRow",
      "VcCol",
    ];

    requiredComponents.forEach(component => {
      it(`should have ${component}`, () => {
        expect(registry).toHaveProperty(component);
      });
    });
  });

  describe("Fictional components don't exist", () => {
    const fictionalComponents = [
      "VcChart",
      "VcStat",
      "VcTabs",
      "VcDivider",
      "VcMenuItem",
      "VcDropdownMenu",
    ];

    fictionalComponents.forEach(component => {
      it(`should not have ${component}`, () => {
        expect(registry).not.toHaveProperty(component);
      });
    });
  });

  describe("VcField special handling", () => {
    it("should exist in registry", () => {
      expect(registry).toHaveProperty("VcField");
    });

    it("should clarify it's for read-only display", () => {
      const vcField = registry.VcField;
      expect(vcField.description).toContain("read-only");
      expect(vcField.description).toContain("NOT");
    });

    it("should have Display category, not Form", () => {
      const vcField = registry.VcField;
      expect(vcField.category).toBe("Display");
    });
  });

  describe("Component structure", () => {
    it("VcTable should have compositions", () => {
      expect(registry.VcTable).toHaveProperty("compositions");
      expect(Array.isArray(registry.VcTable.compositions)).toBe(true);
    });

    it("VcBlade should have templates and compositions", () => {
      expect(registry.VcBlade).toHaveProperty("templates");
      expect(registry.VcBlade).toHaveProperty("compositions");
    });

    it("all components should have import property", () => {
      Object.values(registry).forEach((component: any) => {
        if (component.import) {
          expect(component.import).toBe("@vc-shell/framework");
        }
      });
    });
  });
});

