import { describe, it, expect } from "vitest";
import { Validator } from "../core/validator";

describe("Schema Validation", () => {
  const validator = new Validator();

  describe("Component types", () => {
    it("should accept VcTable component", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-list",
          route: "/test",
          layout: "grid",
          title: "Test",
          components: [{ type: "VcTable" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should accept VcForm component", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-details",
          route: "/test",
          layout: "details",
          title: "Test",
          components: [{ type: "VcForm" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should reject DataTable (old name)", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-list",
          route: "/test",
          layout: "grid",
          title: "Test",
          components: [{ type: "DataTable" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
    });

    it("should reject Form (old name)", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-details",
          route: "/test",
          layout: "details",
          title: "Test",
          components: [{ type: "Form" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
    });
  });

  describe("Field types", () => {
    it("should accept VcInput field type", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-details",
          route: "/test",
          layout: "details",
          title: "Test",
          components: [{
            type: "VcForm",
            fields: [
              { key: "name", as: "VcInput", label: "Name" }
            ]
          }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should accept VcSelect field type", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-details",
          route: "/test",
          layout: "details",
          title: "Test",
          components: [{
            type: "VcForm",
            fields: [
              { key: "status", as: "VcSelect", label: "Status" }
            ]
          }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should reject Text (old field type)", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-details",
          route: "/test",
          layout: "details",
          title: "Test",
          components: [{
            type: "VcForm",
            fields: [
              { key: "name", as: "Text", label: "Name" }
            ]
          }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
    });
  });

  describe("URL validation", () => {
    it("should accept URLs without :id", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [
          { id: "list", route: "/vendors", layout: "grid", title: "List", components: [] },
          { id: "details", route: "/vendor", layout: "details", title: "Details", components: [] }
        ]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should accept complex routes", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test",
          route: "/products/category",
          layout: "grid",
          title: "Test",
          components: []
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });
  });

  describe("Component registry validation", () => {
    it("should find VcTable in registry", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test-list",
          route: "/test",
          layout: "grid",
          title: "Test",
          components: [{ type: "VcTable" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-existent component", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "test",
        blades: [{
          id: "test",
          route: "/test",
          layout: "grid",
          title: "Test",
          components: [{ type: "VcChart" }]
        }]
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.message?.includes("VcChart"))).toBe(true);
    });
  });
});

