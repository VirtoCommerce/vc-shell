/**
 * Tests for Prompt Analyzer
 * Tests the prompt analysis schema, validation, and prompt building
 */

import { describe, it, expect } from "vitest";
import {
  buildAnalysisPrompt,
  getPromptAnalysisSchema,
  validatePromptAnalysis,
  type PromptAnalysis,
} from "../core/prompt-analyzer.js";

describe("Prompt Analyzer", () => {
  describe("buildAnalysisPrompt", () => {
    it("should build analysis prompt with user prompt included", () => {
      const userPrompt = "Create product management with filtering";
      const prompt = buildAnalysisPrompt(userPrompt);

      expect(prompt).toContain("# Task: Analyze UI Module Prompt");
      expect(prompt).toContain(userPrompt);
      expect(prompt).toContain("Entity names");
      expect(prompt).toContain("Features");
      expect(prompt).toContain("Table columns");
      expect(prompt).toContain("Form fields");
    });

    it("should include supported features list", () => {
      const prompt = buildAnalysisPrompt("Test");

      expect(prompt).toContain("filters");
      expect(prompt).toContain("multiselect");
      expect(prompt).toContain("validation");
      expect(prompt).toContain("gallery");
      expect(prompt).toContain("widgets");
      expect(prompt).toContain("reorderable");
    });

    it("should include supported field components", () => {
      const prompt = buildAnalysisPrompt("Test");

      expect(prompt).toContain("VcInput");
      expect(prompt).toContain("VcTextarea");
      expect(prompt).toContain("VcSelect");
      expect(prompt).toContain("VcCheckbox");
      expect(prompt).toContain("VcSwitch");
      expect(prompt).toContain("VcInputCurrency");
      expect(prompt).toContain("VcEditor");
      expect(prompt).toContain("VcFileUpload");
    });

    it("should include examples for different languages", () => {
      const prompt = buildAnalysisPrompt("Test");

      expect(prompt).toContain("Create product management");
      expect(prompt).toContain("Vendor management with filtering");
      expect(prompt).toContain("Каталог товаров"); // Russian
    });

    it("should include JSON schema structure", () => {
      const prompt = buildAnalysisPrompt("Test");

      expect(prompt).toContain("entityName");
      expect(prompt).toContain("entityNameSingular");
      expect(prompt).toContain("listFeatures");
      expect(prompt).toContain("detailsFeatures");
      expect(prompt).toContain("columns");
      expect(prompt).toContain("fields");
      expect(prompt).toContain("relationships");
      expect(prompt).toContain("businessRules");
      expect(prompt).toContain("confidence");
    });

    it("should handle special characters in user prompt", () => {
      const userPrompt = 'Products with "quotes" and <tags>';
      const prompt = buildAnalysisPrompt(userPrompt);

      expect(prompt).toContain(userPrompt);
    });

    it("should provide clear instructions", () => {
      const prompt = buildAnalysisPrompt("Test");

      expect(prompt).toContain("ANY language");
      expect(prompt).toContain("kebab-case");
      expect(prompt).toContain("Return ONLY valid JSON");
      expect(prompt).toContain("conservative with features");
    });
  });

  describe("getPromptAnalysisSchema", () => {
    it("should return valid JSON schema", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema).toHaveProperty("$schema");
      expect(schema.type).toBe("object");
      expect(schema.required).toContain("entityName");
      expect(schema.required).toContain("entityNameSingular");
      expect(schema.required).toContain("listFeatures");
      expect(schema.required).toContain("detailsFeatures");
      expect(schema.required).toContain("confidence");
    });

    it("should define entityName pattern", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.entityName.pattern).toBe("^[a-z][a-z0-9-]*$");
      expect(schema.properties.entityNameSingular.pattern).toBe("^[a-z][a-z0-9-]*$");
    });

    it("should define listFeatures enum", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.listFeatures.items.enum).toContain("filters");
      expect(schema.properties.listFeatures.items.enum).toContain("multiselect");
      expect(schema.properties.listFeatures.items.enum).toContain("reorderable");
    });

    it("should define detailsFeatures enum", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.detailsFeatures.items.enum).toContain("validation");
      expect(schema.properties.detailsFeatures.items.enum).toContain("gallery");
      expect(schema.properties.detailsFeatures.items.enum).toContain("widgets");
    });

    it("should define column structure", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.columns.items.required).toContain("id");
      expect(schema.properties.columns.items.required).toContain("title");
      expect(schema.properties.columns.items.properties).toHaveProperty("id");
      expect(schema.properties.columns.items.properties).toHaveProperty("title");
      expect(schema.properties.columns.items.properties).toHaveProperty("type");
      expect(schema.properties.columns.items.properties).toHaveProperty("sortable");
    });

    it("should define field structure", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.fields.items.required).toContain("key");
      expect(schema.properties.fields.items.required).toContain("label");
      expect(schema.properties.fields.items.required).toContain("as");
      expect(schema.properties.fields.items.properties.as.enum).toContain("VcInput");
      expect(schema.properties.fields.items.properties.as.enum).toContain("VcTextarea");
    });

    it("should define confidence range", () => {
      const schema = getPromptAnalysisSchema();

      expect(schema.properties.confidence.minimum).toBe(0);
      expect(schema.properties.confidence.maximum).toBe(1);
    });
  });

  describe("validatePromptAnalysis", () => {
    it("should validate correct analysis", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: ["filters"],
        detailsFeatures: ["validation"],
        columns: [{ id: "name", title: "Name", type: "text", sortable: true }],
        fields: [{ id: "name", label: "Name", as: "VcInput", required: true }],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require entityName", () => {
      const analysis: any = {
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: entityName");
    });

    it("should require entityNameSingular", () => {
      const analysis: any = {
        entityName: "products",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: entityNameSingular");
    });

    it("should require confidence", () => {
      const analysis: any = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
      };

      const result = validatePromptAnalysis(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: confidence");
    });

    it("should validate entityName format (kebab-case)", () => {
      const analysis1: any = {
        entityName: "ProductCategories", // Invalid: PascalCase
        entityNameSingular: "product-category",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result1 = validatePromptAnalysis(analysis1);
      expect(result1.valid).toBe(false);
      expect(result1.errors[0]).toContain("entityName must be kebab-case");

      const analysis2: any = {
        entityName: "product_categories", // Invalid: snake_case
        entityNameSingular: "product-category",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result2 = validatePromptAnalysis(analysis2);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain("entityName must be kebab-case");
    });

    it("should validate entityNameSingular format (kebab-case)", () => {
      const analysis: any = {
        entityName: "products",
        entityNameSingular: "Product", // Invalid: PascalCase
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("entityNameSingular must be kebab-case");
    });

    it("should validate confidence range", () => {
      const analysis1: any = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 1.5, // Invalid: > 1
      };

      const result1 = validatePromptAnalysis(analysis1);
      expect(result1.valid).toBe(false);
      expect(result1.errors[0]).toContain("confidence must be between 0 and 1");

      const analysis2: any = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        confidence: -0.1, // Invalid: < 0
      };

      const result2 = validatePromptAnalysis(analysis2);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain("confidence must be between 0 and 1");
    });

    it("should validate listFeatures values", () => {
      const analysis: any = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: ["filters", "invalid-feature"],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid list feature: "invalid-feature"');
      expect(result.errors[0]).toContain("filters, multiselect, reorderable");
    });

    it("should validate detailsFeatures values", () => {
      const analysis: any = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: ["validation", "bad-feature"],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid details feature: "bad-feature"');
      expect(result.errors[0]).toContain("validation, gallery, widgets");
    });

    it("should allow valid list features", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: ["filters", "multiselect", "reorderable"],
        detailsFeatures: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(true);
    });

    it("should allow valid details features", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: ["validation", "gallery", "widgets"],
        confidence: 0.9,
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(true);
    });

    it("should allow optional fields to be missing", () => {
      const analysis: PromptAnalysis = {
        entityName: "products",
        entityNameSingular: "product",
        listFeatures: [],
        detailsFeatures: [],
        confidence: 0.9,
        // columns, fields, relationships, businessRules are optional
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(true);
    });

    it("should collect multiple errors", () => {
      const analysis: any = {
        entityName: "ProductCategories", // Invalid format
        entityNameSingular: "Product", // Invalid format
        listFeatures: ["invalid1"],
        detailsFeatures: ["invalid2"],
        confidence: 1.5, // Invalid range
      };

      const result = validatePromptAnalysis(analysis);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });
});
