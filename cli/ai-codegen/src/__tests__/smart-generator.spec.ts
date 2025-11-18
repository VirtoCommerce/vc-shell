import { describe, it, expect, beforeEach } from "vitest";
import { SmartCodeGenerator, GenerationStrategy } from "../core/smart-generator.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import type { NamingConfig } from "../core/code-generator.js";

describe("SmartCodeGenerator (AI full only)", () => {
  let generator: SmartCodeGenerator;

  beforeEach(() => {
    generator = new SmartCodeGenerator();
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
    } as NamingConfig;
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
    } as BladeGenerationContext;
  }

  describe("decide()", () => {
    it("always returns AI_FULL with a guide", async () => {
      const context = createContext("list");

      const decision = await generator.decide(context);

      expect(decision.strategy).toBe(GenerationStrategy.AI_FULL);
      expect(decision.aiGuide).toBeDefined();
      expect(decision.willUseFallback).toBe(false);
      expect(decision.reason).toMatch(/AI full mode enforced/);
    });

    it("ignores deprecated strategies and still returns AI_FULL", async () => {
      const context = createContext("details", ["widgets", "validation"]);

      const decision = await generator.decide(context, {
        // @ts-expect-error Legacy strategies are ignored
        forceStrategy: "template",
      });

      expect(decision.strategy).toBe(GenerationStrategy.AI_FULL);
      expect(decision.reason).toContain("AI full mode enforced");
    });
  });

  describe("complexity calculation", () => {
    it("should calculate base complexity for list blade", async () => {
      const context = createContext("list");
      const decision = await generator.decide(context);
      expect(decision.complexity).toBe(5);
    });

    it("should calculate base complexity for details blade", async () => {
      const context = createContext("details");
      const decision = await generator.decide(context);
      expect(decision.complexity).toBe(4);
    });

    it("should add +2 per feature", async () => {
      const context = createContext("list", ["filters", "multiselect"]);
      const decision = await generator.decide(context);
      expect(decision.complexity).toBe(9); // Base 5 + 4 from features
    });

    it("should add +5 for widgets feature", async () => {
      const context = createContext("details", ["widgets"]);
      const decision = await generator.decide(context);
      expect(decision.complexity).toBe(11); // Base 4 + widgets bonus 7
    });

    it("should add +2 for gallery feature", async () => {
      const context = createContext("details", ["gallery"]);
      const decision = await generator.decide(context);
      expect(decision.complexity).toBe(8); // Base 4 + 4 from gallery
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
      expect(decision.complexity).toBe(6);
    });

    it("should add complexity for custom logic", async () => {
      const context = createContext("details", [], {
        logic: {
          handlers: {
            onSave: "Save handler",
            onDelete: "Delete handler",
          },
          toolbar: [{ id: "save", icon: "fas fa-save", action: "onSave" }],
          state: {
            loading: { source: "composable", reactive: true },
            item: { source: "composable", reactive: true },
          },
        },
      });

      const decision = await generator.decide(context);
      expect(decision.complexity).toBeGreaterThan(4);
    });
  });
});
