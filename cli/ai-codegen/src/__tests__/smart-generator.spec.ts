import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SmartCodeGenerator,
  GenerationStrategy,
  type StrategyDecision,
  type GenerationOptions,
} from "../core/smart-generator.js";
import type { BladeGenerationContext } from "../core/ai-code-generator.js";
import type { NamingConfig } from "../core/code-generator.js";

describe("SmartCodeGenerator", () => {
  let generator: SmartCodeGenerator;

  beforeEach(() => {
    generator = new SmartCodeGenerator();

    // Mock the guideBuilder to avoid context type mismatch
    // The SmartCodeGenerator passes ai-code-generator's BladeGenerationContext
    // But AIGenerationGuideBuilder expects its own BladeGenerationContext format
    // This is a known issue - for tests we mock it
    (generator ).guideBuilder = {
      buildGuide: vi.fn().mockReturnValue({
        task: "Generate blade",
        context: { blade: {}, entity: "Product", module: "products", features: [], complexity: 10 },
        instructions: { summary: "Summary", steps: [], examples: { similar: [], templateReference: "" }, constraints: [], patterns: [] },
        verification: { checklist: [], mustHave: [], mustNotHave: [] },
      }),
    };
  });

  // Helper to create minimal naming config
  function createNaming(moduleName: string): NamingConfig {
    return {
      moduleName,
      moduleNamePascal: "Products",
      moduleNameCamel: "products",
      moduleNameUpperSnake: "PRODUCTS",
      entitySingular: "Product",
      entitySingularPascal: "Product",
      entitySingularCamel: "product",
      entitySingularKebab: "product",
      entityPlural: "Products",
      entityPluralPascal: "Products",
      entityPluralCamel: "products",
      entityPluralKebab: "products",
    };
  }

  // Helper to create minimal context
  function createContext(
    type: "list" | "details",
    features: string[] = [],
    extras: Partial<BladeGenerationContext> = {},
  ): BladeGenerationContext {
    return {
      type,
      naming: createNaming("products"),
      entity: "product",
      module: "products",
      features,
      blade: {
        id: `product-${type}`,
        layout: type === "list" ? "grid" : "details",
        components: [],
      },
      componentName: type === "list" ? "ProductsList" : "ProductDetails",
      composableName: type === "list" ? "useProductList" : "useProduct",
      route: "/products",
      menuTitleKey: "PRODUCTS.MENU.TITLE",
      columns: type === "list" ? [] : undefined,
      fields: type === "details" ? [] : undefined,
      ...extras,
    };
  }

  describe("decide()", () => {
    it("should choose TEMPLATE strategy for simple list blade", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.TEMPLATE);
      expect(decision.complexity).toBeLessThanOrEqual(5);
      expect(decision.willUseFallback).toBe(false);
      expect(decision.reason).toContain("Low complexity");
    });

    it("should choose TEMPLATE strategy for simple details blade", async () => {
      const context = createContext("details");

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.TEMPLATE);
      expect(decision.complexity).toBeLessThanOrEqual(5);
    });

    it("should choose COMPOSITION strategy for moderate complexity", async () => {
      // Use just one feature to keep complexity in COMPOSITION range (5-7)
      const context = createContext("list", ["filters"]);

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.COMPOSITION);
      expect(decision.complexity).toBeGreaterThan(5);
      expect(decision.complexity).toBeLessThanOrEqual(7);
      expect(decision.willUseFallback).toBe(true);
      expect(decision.reason).toContain("Moderate complexity");
    });

    it("should choose AI_GUIDED strategy for high complexity", async () => {
      const context = createContext("details", ["validation", "gallery", "widgets"], {
        blade: {
          id: "product-details",
          layout: "details",
          components: [],
          widgets: [
            { id: "related", component: "RelatedProductsWidget" },
            { id: "stats", component: "StatsWidget" },
          ],
        },
        fields: [
          { key: "name", as: "VcInput", label: "Name", required: true },
          { key: "description", as: "VcTextarea", label: "Description" },
          { key: "price", as: "VcInput", label: "Price", type: "number" },
          { key: "category", as: "VcSelect", label: "Category" },
          { key: "tags", as: "VcMultivalue", label: "Tags" },
        ],
      });

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.AI_GUIDED);
      expect(decision.complexity).toBeGreaterThan(7);
      expect(decision.willUseFallback).toBe(true);
      expect(decision.aiGuide).toBeDefined();
    });

    it("should choose AI_GUIDED strategy when no known patterns exist", async () => {
      const context = createContext("list", ["filters", "multiselect", "gallery", "validation"]);

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.AI_GUIDED);
      expect(decision.reason).toMatch(/No known patterns|Moderate-high complexity/);
    });

    it("should respect forceStrategy option", async () => {
      const context = createContext("list");

      const options: GenerationOptions = {
        forceStrategy: GenerationStrategy.AI_GUIDED,
      };

      const decision = await generator.decide(context, options);

      expect(decision.strategy).toBe(GenerationStrategy.AI_GUIDED);
      expect(decision.reason).toBe("User-specified strategy");
    });

    it("should handle allowFallback option", async () => {
      const context = createContext("list", ["filters"]);

      const options: GenerationOptions = {
        forceStrategy: GenerationStrategy.COMPOSITION,
        allowFallback: false,
      };

      const decision = await generator.decide(context, options);

      expect(decision.strategy).toBe(GenerationStrategy.COMPOSITION);
      expect(decision.willUseFallback).toBe(false);
    });
  });

  describe("complexity calculation", () => {
    it("should calculate base complexity for list blade", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);

      // Base complexity for list is 5
      expect(decision.complexity).toBe(5);
    });

    it("should calculate base complexity for details blade", async () => {
      const context = createContext("details");

      const decision = await generator.decide(context);

      // Base complexity for details is 4
      expect(decision.complexity).toBe(4);
    });

    it("should add +2 per feature", async () => {
      const context = createContext("list", ["filters", "multiselect"]);

      const decision = await generator.decide(context);

      // Base 5 + 2 features * 2 = 9
      expect(decision.complexity).toBe(9);
    });

    it("should add +5 for widgets feature", async () => {
      const context = createContext("details", ["widgets"]);

      const decision = await generator.decide(context);

      // Base 4 + widgets feature 2 + widgets bonus 5 = 11
      expect(decision.complexity).toBe(11);
    });

    it("should add +2 for gallery feature", async () => {
      const context = createContext("details", ["gallery"]);

      const decision = await generator.decide(context);

      // Base 4 + gallery feature 2 + gallery bonus 2 = 8
      expect(decision.complexity).toBe(8);
    });

    it("should add complexity for custom slots", async () => {
      const context = createContext("list", [], {
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
          customSlots: [
            { name: "status", template: "<StatusBadge />" },
            { name: "actions", template: "<ActionButtons />" },
          ],
        },
      });

      const decision = await generator.decide(context);

      // Base 5 + 2 slots * 0.5 = 6
      expect(decision.complexity).toBe(6);
    });

    it("should add complexity for custom logic", async () => {
      const context = createContext("list", [], {
        logic: {
          handlers: {
            onSave: "Save handler",
            onDelete: "Delete handler",
            onExport: "Export handler",
          },
          toolbar: [
            { id: "save", icon: "fas fa-save", action: "save()" },
            { id: "delete", icon: "fas fa-trash", action: "delete()" },
          ],
          state: {
            loading: { source: "composable", reactive: true },
            items: { source: "composable", reactive: true },
          },
        },
      });

      const decision = await generator.decide(context);

      // Base 5 + 3 handlers * 0.5 + 2 toolbar * 0.3 + 2 state * 0.2 = 5 + 1.5 + 0.6 + 0.4 = 7.5 → 8
      expect(decision.complexity).toBeGreaterThanOrEqual(7);
    });

    it("should cap complexity at 20", async () => {
      const context = createContext("details", ["filters", "multiselect", "validation", "gallery", "widgets"], {
        blade: {
          id: "product-details",
          layout: "details",
          components: [],
          widgets: [
            { id: "w1", component: "W1" },
            { id: "w2", component: "W2" },
            { id: "w3", component: "W3" },
          ],
          customSlots: [
            { name: "s1", template: "S1" },
            { name: "s2", template: "S2" },
            { name: "s3", template: "S3" },
          ],
        },
        fields: Array.from({ length: 20 }, (_, i) => ({
          key: `field${i}`,
          as: "VcInput",
          label: `Field ${i}`,
        })),
        logic: {
          handlers: {
            h1: "H1",
            h2: "H2",
            h3: "H3",
            h4: "H4",
            h5: "H5",
          },
          toolbar: Array.from({ length: 10 }, (_, i) => ({
            id: `btn${i}`,
            icon: "icon",
            action: "action()",
          })),
          state: {
            s1: { source: "composable", reactive: true },
            s2: { source: "composable", reactive: true },
            s3: { source: "composable", reactive: true },
          },
        },
      });

      const decision = await generator.decide(context);

      expect(decision.complexity).toBeLessThanOrEqual(20);
    });
  });

  describe("pattern detection", () => {
    it("should detect basic list/details as known pattern", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);

      // Should choose TEMPLATE for known simple pattern
      expect(decision.strategy).toBe(GenerationStrategy.TEMPLATE);
    });

    it("should detect single known feature as known pattern", async () => {
      const knownFeatures = ["filters", "multiselect", "validation"];

      for (const feature of knownFeatures) {
        const context = createContext("list", [feature]);

        const decision = await generator.decide(context);

        // Should not be AI_GUIDED for single known feature
        // Single features get COMPOSITION due to complexity 7 (base 5 + feature 2)
        expect([GenerationStrategy.TEMPLATE, GenerationStrategy.COMPOSITION]).toContain(
          decision.strategy,
        );
      }
    });

    it("should detect widgets as unknown pattern", async () => {
      const context = createContext("details", ["widgets"]);

      const decision = await generator.decide(context);

      // Widgets always trigger AI_GUIDED
      expect(decision.strategy).toBe(GenerationStrategy.AI_GUIDED);
    });

    it("should detect more than 2 features as unknown pattern", async () => {
      const context = createContext("list", ["filters", "multiselect", "validation"]);

      const decision = await generator.decide(context);

      // More than 2 features should trigger AI_GUIDED
      expect(decision.strategy).toBe(GenerationStrategy.AI_GUIDED);
    });
  });

  describe("explainDecision()", () => {
    it("should explain TEMPLATE strategy", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);
      const explanation = generator.explainDecision(decision);

      expect(explanation).toContain("TEMPLATE");
      expect(explanation).toContain("Complexity:");
      expect(explanation).toContain("Estimated Time:");
      expect(explanation).toContain("template");
    });

    it("should explain COMPOSITION strategy", async () => {
      const context = createContext("list", ["filters"]);

      const decision = await generator.decide(context);
      const explanation = generator.explainDecision(decision);

      expect(explanation).toContain("COMPOSITION");
      expect(explanation).toContain("patterns");
      expect(explanation).toContain("compose");
    });

    it("should explain AI_GUIDED strategy", async () => {
      const context = createContext("details", ["widgets"]);

      const decision = await generator.decide(context);
      const explanation = generator.explainDecision(decision);

      // Note: Strategy name is "AI-GUIDED" (with hyphen) in output
      expect(explanation).toMatch(/AI[-_]GUIDED/);
      expect(explanation).toContain("guide");
      expect(explanation).toContain("step-by-step");
    });
  });

  describe("estimated time", () => {
    it("should estimate 1-2 seconds for TEMPLATE", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);

      expect(decision.estimatedTime).toBe("1-2 seconds");
    });

    it("should estimate 3-5 seconds for COMPOSITION", async () => {
      const context = createContext("list", ["filters"]);

      const decision = await generator.decide(context);

      expect(decision.estimatedTime).toBe("3-5 seconds");
    });

    it("should explain AI reading time for AI_GUIDED", async () => {
      const context = createContext("details", ["widgets"]);

      const decision = await generator.decide(context);

      expect(decision.estimatedTime).toContain("AI");
    });
  });
});
