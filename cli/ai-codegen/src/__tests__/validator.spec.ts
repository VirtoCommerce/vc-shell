import { describe, it, expect, beforeAll } from "vitest";
import { Validator } from "../core/validator";

describe("Validator", () => {
  let validator: Validator;

  beforeAll(() => {
    validator = new Validator();
  });

  describe("validateUIPlan", () => {
    it("should validate a correct UI-Plan", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-list",
            route: "/products",
            layout: "grid",
            title: "Products",
            isWorkspace: true,
            components: [
              {
                type: "VcTable",
                dataSource: "products",
                columns: [
                  { id: "name", title: "Name" },
                  { id: "price", title: "Price" },
                ],
                actions: ["add"],
              },
            ],
            permissions: ["product:read"],
            theme: { variant: "system" },
          },
        ],
        data: {
          sources: {
            products: { type: "api", endpoint: "/api/products" },
          },
        },
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject plan without required fields", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        blades: [],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject plan with invalid module name", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "InvalidModuleName", // Should be kebab-case
        blades: [
          {
            id: "test-blade",
            route: "/test",
            layout: "grid",
            title: "Test",
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "/module")).toBe(true);
    });

    it("should reject plan with route not starting with /", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-list",
            route: "products", // Should start with /
            layout: "grid",
            title: "Products",
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("Route"))).toBe(true);
    });

    it("should reject plan with too many fields in form", () => {
      const fields = Array.from({ length: 51 }, (_, i) => ({
        key: `field${i}`,
        as: "VcInput",
        label: `Field ${i}`,
      }));

      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-details",
            route: "/product",
            layout: "details",
            title: "Product",
            components: [
              {
                type: "VcForm",
                model: "product",
                fields,
              },
            ],
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      // JSON Schema returns "must NOT have more than 50 items"
      expect(result.errors.some((e) => e.message.includes("50"))).toBe(true);
    });

    it("should reject plan with unknown component type", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-list",
            route: "/products",
            layout: "grid",
            title: "Products",
            components: [
              {
                type: "UnknownComponent", // Not in registry
              },
            ],
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("not found in Component Registry"))).toBe(true);
    });

    it("should accept plan with valid field types", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-details",
            route: "/product",
            layout: "details",
            title: "Product",
            components: [
              {
                type: "VcForm",
                model: "product",
                fields: [
                  { key: "name", as: "VcInput", label: "Name" },
                  { key: "email", as: "VcInput", label: "Email" },
                  { key: "website", as: "VcInput", label: "Website" },
                  { key: "price", as: "VcInput", label: "Price" },
                  { key: "date", as: "VcInput", label: "Date" },
                  { key: "description", as: "VcTextarea", label: "Description" },
                ],
              },
            ],
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(true);
    });

    it("should reject plan with invalid field type", () => {
      const plan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "product-details",
            route: "/product",
            layout: "details",
            title: "Product",
            components: [
              {
                type: "VcForm",
                model: "product",
                fields: [
                  { key: "name", as: "InvalidType", label: "Name" }, // Invalid field type
                ],
              },
            ],
          },
        ],
      };

      const result = validator.validateUIPlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("Invalid field type"))).toBe(true);
    });
  });

  describe("getComponentRegistry", () => {
    it("should return component registry", () => {
      const registry = validator.getComponentRegistry();
      expect(registry).toBeDefined();
      expect(registry.VcForm).toBeDefined();
      expect(registry.VcTable).toBeDefined();
      expect(registry.VcInput).toBeDefined();
    });
  });
});
