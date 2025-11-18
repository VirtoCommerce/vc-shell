/**
 * Tests for Planner with AI Analysis
 * Tests the integration of Planner with PromptAnalysis from prompt-analyzer
 */

import { describe, it, expect } from "vitest";
import { Planner } from "../core/planner.js";
import type { PromptAnalysis } from "../core/prompt-analyzer.js";

describe("Planner with AI Analysis", () => {
  const planner = new Planner();

  describe("generatePlan with analysis", () => {
    it("should generate UI-Plan from simple analysis", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        columns: [
          { key: "name", title: "Name", type: "text", sortable: true },
          { key: "price", title: "Price", type: "number", sortable: true },
        ],
        fields: [
          { key: "name", label: "Product Name", as: "VcInput", required: true },
          { key: "price", label: "Price", as: "VcInputCurrency", required: true },
        ],
        confidence: 0.9,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      expect(plan.module).toBe("products");
      expect(plan.blades).toHaveLength(2);

      // Check list blade
      const listBlade = plan.blades.find((b) => b.id === "products-list");
      expect(listBlade).toBeDefined();
      expect(listBlade?.layout).toBe("grid");
      expect(listBlade?.components?.[0].type).toBe("VcTable");
      expect(listBlade?.components?.[0].columns).toEqual(analysis.columns);
      expect(listBlade?.features).toEqual([]);

      // Check details blade
      const detailsBlade = plan.blades.find((b) => b.id === "product-details");
      expect(detailsBlade).toBeDefined();
      expect(detailsBlade?.layout).toBe("details");
      expect(detailsBlade?.components?.[0].type).toBe("VcForm");
      expect(detailsBlade?.components?.[0].fields).toEqual(analysis.fields);
    });

    it("should include features from analysis", () => {
      const analysis: PromptAnalysis = {
        entityName: "vendors",
        entityNameSingular: "vendor",
        listFeatures: ["filters", "multiselect"],
        detailsFeatures: ["validation", "gallery"],
        columns: [
          { key: "name", title: "Name", type: "text", sortable: true },
        ],
        fields: [
          { key: "name", label: "Vendor Name", as: "VcInput", required: true },
        ],
        confidence: 0.85,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      const listBlade = plan.blades.find((b) => b.id === "vendors-list");
      expect(listBlade?.features).toEqual(["filters", "multiselect"]);

      const detailsBlade = plan.blades.find((b) => b.id === "vendor-details");
      expect(detailsBlade?.features).toEqual(["validation", "gallery"]);
    });

    it("should support complex columns with status type", () => {
      const analysis: PromptAnalysis = {
        entityName: "orders",
        entityNameSingular: "order",
        listFeatures: [],
        detailsFeatures: [],
        columns: [
          { key: "orderNumber", title: "Order #", type: "text", sortable: true },
          { key: "status", title: "Status", type: "status", sortable: false },
          { key: "total", title: "Total", type: "number", sortable: true },
          { key: "createdDate", title: "Created", type: "date", sortable: true },
        ],
        fields: [
          { key: "orderNumber", label: "Order Number", as: "VcInput", required: true },
          { key: "status", label: "Status", as: "VcSelect", required: true },
        ],
        confidence: 0.95,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      const listBlade = plan.blades.find((b) => b.id === "orders-list");
      expect(listBlade?.components?.[0].columns).toEqual(analysis.columns);
      expect(listBlade?.components?.[0].columns?.[1].type).toBe("status");
    });

    it("should support field types and validation", () => {
      const analysis: PromptAnalysis = {
        entityName: "users",
        entityNameSingular: "user",
        listFeatures: [],
        detailsFeatures: ["validation"],
        columns: [
          { key: "email", title: "Email", type: "text", sortable: true },
        ],
        fields: [
          { key: "email", label: "Email", as: "VcInput", required: true, type: "email" },
          { key: "password", label: "Password", as: "VcInput", required: true, type: "password" },
          { key: "active", label: "Active", as: "VcSwitch", required: false },
        ],
        confidence: 0.8,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      const detailsBlade = plan.blades.find((b) => b.id === "user-details");
      expect(detailsBlade?.components?.[0].fields).toEqual(analysis.fields);
      expect(detailsBlade?.features).toContain("validation");
    });

    it("should use module override if provided", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const plan = planner.generatePlan({
        prompt: "",
        module: "catalog-products",
        analysis,
      });

      expect(plan.module).toBe("catalog-products");
      expect(plan.blades.find((b) => b.id === "catalog-products-list")).toBeDefined();
    });

    it("should generate default blades if no columns or fields provided", () => {
      const analysis: PromptAnalysis = {
        entityName: "items",
        entityNameSingular: "item",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.7,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      expect(plan.blades).toHaveLength(2);

      const listBlade = plan.blades.find((b) => b.id === "items-list");
      expect(listBlade?.components?.[0].columns).toEqual([
        { key: "name", title: "Name", sortable: true },
      ]);

      const detailsBlade = plan.blades.find((b) => b.id === "item-details");
      expect(detailsBlade?.components?.[0].fields).toEqual([
        { key: "name", as: "VcInput", label: "Name", required: true },
      ]);
    });

    it("should generate only list blade if only columns provided", () => {
      const analysis: PromptAnalysis = {
        entityName: "categories",
        entityNameSingular: "category",
        listFeatures: [],
        detailsFeatures: [],
        columns: [
          { key: "name", title: "Category Name", type: "text", sortable: true },
          { key: "count", title: "Product Count", type: "number", sortable: true },
        ],
        confidence: 0.9,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      expect(plan.blades).toHaveLength(1);
      expect(plan.blades[0].id).toBe("categories-list");
      expect(plan.blades[0].layout).toBe("grid");
    });

    it("should generate only details blade if only fields provided", () => {
      const analysis: PromptAnalysis = {
        entityName: "settings",
        entityNameSingular: "setting",
        listFeatures: [],
        detailsFeatures: [],
        fields: [
          { key: "siteName", label: "Site Name", as: "VcInput", required: true },
          { key: "siteDescription", label: "Description", as: "VcTextarea", required: false },
        ],
        confidence: 0.9,
      };

      const plan = planner.generatePlan({
        prompt: "",
        analysis,
      });

      expect(plan.blades).toHaveLength(1);
      expect(plan.blades[0].id).toBe("setting-details");
      expect(plan.blades[0].layout).toBe("details");
    });
  });

  describe("generatePlan fallback mode", () => {
    it("should fallback to basic extraction without analysis", () => {
      const plan = planner.generatePlan({
        prompt: "Product management",
      });

      expect(plan.module).toBe("product");
      expect(plan.blades).toHaveLength(2);

      // Check that default columns/fields are used
      const listBlade = plan.blades[0];
      expect(listBlade.components?.[0].columns).toEqual([
        { key: "name", title: "Name", sortable: true },
      ]);

      const detailsBlade = plan.blades[1];
      expect(detailsBlade.components?.[0].fields).toEqual([
        { key: "name", as: "VcInput", label: "Name", required: true },
      ]);
    });

    it("should extract module name from first token", () => {
      const plan1 = planner.generatePlan({ prompt: "vendors with filtering" });
      expect(plan1.module).toBe("vendors");

      const plan2 = planner.generatePlan({ prompt: "order tracking" });
      expect(plan2.module).toBe("order");

      const plan3 = planner.generatePlan({ prompt: "product-categories" });
      expect(plan3.module).toBe("product-categories");
    });

    it("should use default 'items' if prompt is empty", () => {
      const plan = planner.generatePlan({ prompt: "" });
      expect(plan.module).toBe("items");
    });
  });

  describe("getAnalysisPrompt", () => {
    it("should return formatted analysis prompt", () => {
      const prompt = planner.getAnalysisPrompt("Vendor management");

      expect(prompt).toContain("# Task: Analyze UI Module Prompt");
      expect(prompt).toContain("Vendor management");
      expect(prompt).toContain("Entity names");
      expect(prompt).toContain("Features");
      expect(prompt).toContain("Table columns");
      expect(prompt).toContain("Form fields");
      expect(prompt).toContain("Relationships");
      expect(prompt).toContain("Business rules");
    });

    it("should include schema and examples", () => {
      const prompt = planner.getAnalysisPrompt("Test prompt");

      expect(prompt).toContain("entityName");
      expect(prompt).toContain("entityNameSingular");
      expect(prompt).toContain("listFeatures");
      expect(prompt).toContain("detailsFeatures");
      expect(prompt).toContain("columns");
      expect(prompt).toContain("fields");
      expect(prompt).toContain("confidence");
    });
  });

  describe("getAnalysisSchema", () => {
    it("should return valid JSON schema", () => {
      const schema = planner.getAnalysisSchema();

      expect(schema).toHaveProperty("$schema");
      expect(schema).toHaveProperty("type", "object");
      expect(schema).toHaveProperty("required");
      expect(schema).toHaveProperty("properties");

      expect(schema.required).toContain("entityName");
      expect(schema.required).toContain("entityNameSingular");
      expect(schema.required).toContain("confidence");

      expect(schema.properties).toHaveProperty("entityName");
      expect(schema.properties).toHaveProperty("listFeatures");
      expect(schema.properties).toHaveProperty("detailsFeatures");
      expect(schema.properties).toHaveProperty("columns");
      expect(schema.properties).toHaveProperty("fields");
    });
  });
});
