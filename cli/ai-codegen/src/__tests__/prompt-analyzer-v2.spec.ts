/**
 * Tests for Prompt Analyzer V2
 * Tests extended validation and schema
 */

import { describe, it, expect } from "vitest";
import {
  validatePromptAnalysisV2,
  getPromptAnalysisSchemaV2,
  buildAnalysisPromptV2,
  type PromptAnalysisV2,
} from "../core/prompt-analyzer-v2.js";

describe("Prompt Analyzer V2", () => {
  describe("validatePromptAnalysisV2", () => {
    it("should validate correct V2 analysis", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "order-management",
        entities: [
          {
            name: "orders",
            singular: "order",
            blades: [
              {
                type: "list",
                features: ["filters"],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "moderate",
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require moduleName", () => {
      const analysis: any = {
        entities: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: moduleName");
    });

    it("should require entities array", () => {
      const analysis: any = {
        moduleName: "test",
        confidence: 0.9,
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("entities");
    });

    it("should require at least one entity", () => {
      const analysis: any = {
        moduleName: "test",
        entities: [],
        confidence: 0.9,
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("non-empty array");
    });

    it("should validate entity structure", () => {
      const analysis: any = {
        moduleName: "test",
        entities: [
          {
            name: "products",
            // missing: singular, blades
          },
        ],
        confidence: 0.9,
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate complexity enum", () => {
      const analysis: any = {
        moduleName: "test",
        entities: [
          {
            name: "products",
            singular: "product",
            blades: [{ type: "list", features: [] }],
          },
        ],
        confidence: 0.9,
        complexity: "invalid",
      };

      const result = validatePromptAnalysisV2(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("complexity");
    });
  });

  describe("buildAnalysisPromptV2", () => {
    it("should build comprehensive V2 prompt", () => {
      const prompt = buildAnalysisPromptV2("Order management with approval workflow");

      expect(prompt).toContain("Task: Analyze UI Module Prompt");
      expect(prompt).toContain("Order management with approval workflow");
      expect(prompt).toContain("Multiple Entities"); // Case sensitive
      expect(prompt).toContain("Workflow"); // Capitalized
      expect(prompt).toContain("Custom Routes"); // Case sensitive
      expect(prompt).toContain("Custom actions"); // As written in prompt
    });

    it("should include extended feature lists", () => {
      const prompt = buildAnalysisPromptV2("Test");

      expect(prompt).toContain("export");
      expect(prompt).toContain("import");
      expect(prompt).toContain("pagination");
      expect(prompt).toContain("inline-editing");
      expect(prompt).toContain("real-time");
    });

    it("should include workflow types", () => {
      const prompt = buildAnalysisPromptV2("Test");

      expect(prompt).toContain("linear");
      expect(prompt).toContain("branching");
      expect(prompt).toContain("parallel");
    });
  });

  describe("getPromptAnalysisSchemaV2", () => {
    it("should return valid V2 JSON schema", () => {
      const schema = getPromptAnalysisSchemaV2();

      expect(schema).toHaveProperty("$schema");
      expect(schema).toHaveProperty("type", "object");
      expect(schema.required).toContain("moduleName");
      expect(schema.required).toContain("entities");
      expect(schema.required).toContain("confidence");
    });

    it("should define entities as array", () => {
      const schema = getPromptAnalysisSchemaV2();

      expect(schema.properties.entities.type).toBe("array");
      expect(schema.properties.entities.minItems).toBe(1);
    });

    it("should support multiple blade types", () => {
      const schema = getPromptAnalysisSchemaV2();

      const bladeTypeEnum = schema.properties.entities.items.properties.blades.items.properties.type.enum;
      expect(bladeTypeEnum).toContain("list");
      expect(bladeTypeEnum).toContain("details");
      expect(bladeTypeEnum).toContain("dashboard");
      expect(bladeTypeEnum).toContain("wizard");
      expect(bladeTypeEnum).toContain("custom");
    });
  });
});
