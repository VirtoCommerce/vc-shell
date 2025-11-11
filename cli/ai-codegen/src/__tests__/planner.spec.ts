import { describe, it, expect } from "vitest";
import { Planner } from "../core/planner";

describe("Planner", () => {
  const planner = new Planner();

  describe("toSingular", () => {
    it("should convert plural to singular", () => {
      const plan1 = planner.generatePlan({ prompt: "Create vendors with details form", module: "vendors" });
      const detailsBlade = plan1.blades.find(b => b.layout === "details");

      expect(detailsBlade?.route).toBe("/vendor");
      expect(detailsBlade?.id).toContain("vendor-details");
    });

    it("should handle -ies ending", () => {
      const plan = planner.generatePlan({ prompt: "Create categories with edit form", module: "categories" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.route).toBe("/category");
    });

    it("should handle -ses ending", () => {
      const plan = planner.generatePlan({ prompt: "Create classes with details", module: "classes" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.route).toBe("/class");
    });

    it("should handle -xes ending", () => {
      const plan = planner.generatePlan({ prompt: "Create boxes with form", module: "boxes" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.route).toBe("/box");
    });
  });

  describe("URL generation", () => {
    it("should generate correct list blade URL (plural)", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors", module: "vendors" });
      const listBlade = plan.blades.find(b => b.layout === "grid");

      expect(listBlade?.route).toBe("/vendors");
      expect(listBlade?.route).not.toContain(":id");
    });

    it("should generate correct details blade URL (singular, no :id)", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors with details", module: "vendors" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.route).toBe("/vendor");
      expect(detailsBlade?.route).not.toContain(":id");
      expect(detailsBlade?.route).not.toContain("?");
    });

    it("should never include :id in any URLs", () => {
      const plan = planner.generatePlan({ prompt: "Create orders with list and details", module: "orders" });

      plan.blades.forEach(blade => {
        expect(blade.route).not.toContain(":id");
        expect(blade.route).not.toContain("?");
      });
    });
  });

  describe("isWorkspace and menuItem", () => {
    it("should set isWorkspace: true for list blade", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors list", module: "vendors" });
      const listBlade = plan.blades.find(b => b.layout === "grid");

      expect(listBlade?.isWorkspace).toBe(true);
    });

    it("should set isWorkspace: false for details blade", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors with details", module: "vendors" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.isWorkspace).toBe(false);
    });

    it("should NOT include menuItem in details blade", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors with details", module: "vendors" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade).not.toHaveProperty("menuItem");
    });
  });

  describe("Component types", () => {
    it("should use VcTable for list blade", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors list", module: "vendors" });
      const listBlade = plan.blades.find(b => b.layout === "grid");

      expect(listBlade?.components[0]?.type).toBe("VcTable");
      expect(listBlade?.components[0]?.type).not.toBe("DataTable");
    });

    it("should use VcForm for details blade", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors with details", module: "vendors" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(detailsBlade?.components[0]?.type).toBe("VcForm");
      expect(detailsBlade?.components[0]?.type).not.toBe("Form");
    });

    it("should use VcInput for field types", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors form with name and email fields", module: "vendors" });
      const detailsBlade = plan.blades.find(b => b.layout === "details");
      const formComponent = detailsBlade?.components[0];

      expect(formComponent?.fields).toBeDefined();
      formComponent?.fields?.forEach((field: any) => {
        expect(field.as).toMatch(/^Vc/); // Should start with Vc
        expect(field.as).not.toBe("Text");
        expect(field.as).not.toBe("Email");
      });
    });
  });

  describe("Module naming", () => {
    it("should handle kebab-case module names", () => {
      const plan = planner.generatePlan({ prompt: "Create module", module: "vendor-management" });

      expect(plan.module).toBe("vendor-management");
    });

    it("should generate proper blade IDs", () => {
      const plan = planner.generatePlan({ prompt: "Create vendors with list and details", module: "vendors" });

      const listBlade = plan.blades.find(b => b.layout === "grid");
      const detailsBlade = plan.blades.find(b => b.layout === "details");

      expect(listBlade?.id).toMatch(/vendors/);
      if (detailsBlade) {
        expect(detailsBlade?.id).toMatch(/vendor-details/);
      }
    });
  });
});

