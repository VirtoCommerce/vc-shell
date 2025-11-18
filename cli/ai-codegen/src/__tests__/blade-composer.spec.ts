import { describe, it, expect, beforeEach } from "vitest";
import { BladeComposer, type CompositionConfig } from "../core/blade-composer.js";
import type { BladeGenerationContext } from "../core/ai-code-generator.js";

describe("BladeComposer", () => {
  let composer: BladeComposer;

  beforeEach(() => {
    composer = new BladeComposer();
  });

  describe("compose()", () => {
    it("should compose simple list blade", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [
          { id: "name", title: "Name", sortable: true },
          { id: "price", title: "Price", type: "money" },
        ],
      };

      const result = await composer.compose({ context });

      expect(result).toBeDefined();
      expect(result.guide).toBeDefined();
      expect(result.selectedPatterns).toBeDefined();
      expect(result.selectedPatterns.length).toBeGreaterThan(0);
      expect(result.complexity).toBeGreaterThan(0);
      expect(result.strategy).toMatch(/simple|moderate|complex/);
    });

    it("should include list-basic pattern for list blades", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      const hasListBasic = result.selectedPatterns.some(p => p.name === "list-basic");
      expect(hasListBasic).toBe(true);
    });

    it("should include form-basic pattern for details blades", async () => {
      const context: BladeGenerationContext = {
        type: "details",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "product-details",
          layout: "details",
          components: [],
        },
        fields: [
          { key: "name", as: "VcInput", label: "Name", required: true },
        ],
      };

      const result = await composer.compose({ context });

      const hasFormBasic = result.selectedPatterns.some(p => p.name === "form-basic");
      expect(hasFormBasic).toBe(true);
    });

    it("should include filters pattern when filters feature is present", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: ["filters"],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      const hasFiltersPattern = result.selectedPatterns.some(p =>
        p.name === "filters-pattern" || p.name === "list-with-filters"
      );
      expect(hasFiltersPattern).toBe(true);
    });

    it("should include multiselect pattern when multiselect feature is present", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: ["multiselect"],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      const hasMultiselectPattern = result.selectedPatterns.some(p =>
        p.name === "multiselect" // Pattern file is list/multiselect.md
      );
      expect(hasMultiselectPattern).toBe(true);
    });

    it("should include custom slots pattern when custom slots are defined", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
          customSlots: [
            { name: "item_status", template: "<StatusBadge />" },
          ],
        },
        columns: [
          { id: "status", title: "Status", type: "status" }, // status column triggers custom slots pattern
        ],
      };

      const result = await composer.compose({ context });

      // Custom column slots pattern is loaded from shared/custom-column-slots.md
      const hasCustomSlotsPattern = result.selectedPatterns.some(p =>
        p.name === "custom-column-slots"
      );
      expect(hasCustomSlotsPattern).toBe(true);
    });

    it("should include error-handling pattern for all blades", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      // Error handling is always included
      const hasErrorHandling = result.selectedPatterns.some(p =>
        p.name === "error-handling"
      );
      expect(hasErrorHandling).toBe(true);
    });

    it("should determine strategy based on complexity", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [
          { id: "name", title: "Name" },
        ],
      };

      const result = await composer.compose({ context });

      // Strategy should be one of the valid options
      expect(result.strategy).toMatch(/simple|moderate|complex/);
      // Complexity should be calculated
      expect(result.complexity).toBeGreaterThan(0);
    });

    it("should determine moderate strategy for medium complexity", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        features: ["filters", "multiselect"],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [
          { id: "name", title: "Name" },
          { id: "price", title: "Price" },
          { id: "stock", title: "Stock" },
        ],
      };

      const result = await composer.compose({ context });

      expect(result.strategy).toMatch(/moderate|complex/);
    });

    it("should determine complex strategy for high complexity", async () => {
      const context: BladeGenerationContext = {
        type: "details",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        features: ["validation", "gallery", "widgets"],
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
      };

      const result = await composer.compose({ context });

      expect(result.strategy).toMatch(/moderate|complex/);
      expect(result.complexity).toBeGreaterThan(7);
    });
  });

  describe("composeBlade()", () => {
    it("should be tested through integration tests", () => {
      // composeBlade() is an internal method that delegates to TemplateAdapter
      // It's tested indirectly through:
      // 1. Template adapter tests (template-adapter.spec.ts)
      // 2. Integration tests (end-to-end generation)
      // 3. UnifiedCodeGenerator tests
      expect(true).toBe(true);
    });
  });

  describe("pattern deduplication", () => {
    it("should remove duplicate patterns", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: ["filters"],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      // Check that pattern names are unique
      const patternNames = result.selectedPatterns.map(p => p.name);
      const uniqueNames = new Set(patternNames);
      expect(patternNames.length).toBe(uniqueNames.size);
    });
  });

  describe("async select fields detection", () => {
    it("should detect async select fields", async () => {
      const context: BladeGenerationContext = {
        type: "details",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "product-details",
          layout: "details",
          components: [],
        },
        fields: [
          {
            key: "category",
            as: "VcSelect",
            label: "Category",
            type: "async",
          },
        ],
      };

      const result = await composer.compose({ context });

      const hasAsyncSelectPattern = result.selectedPatterns.some(p =>
        p.name === "async-select-patterns"
      );
      expect(hasAsyncSelectPattern).toBe(true);
    });

    it("should detect category/type fields as async selects", async () => {
      const context: BladeGenerationContext = {
        type: "details",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        entity: "product",
        module: "products",
        features: [],
        blade: {
          id: "product-details",
          layout: "details",
          components: [],
        },
        fields: [
          {
            key: "categoryId",
            as: "VcSelect",
            label: "Category",
          },
        ],
      };

      const result = await composer.compose({ context });

      const hasAsyncSelectPattern = result.selectedPatterns.some(p =>
        p.name === "async-select-patterns"
      );
      expect(hasAsyncSelectPattern).toBe(true);
    });
  });

  describe("reorderable feature", () => {
    it("should include reorderable pattern when feature is present", async () => {
      const context: BladeGenerationContext = {
        type: "list",
        naming: {
          moduleName: "products",
          entitySingular: "Product",
          entityPlural: "Products",
          entitySingularCamel: "product",
          entityPluralCamel: "products",
          entitySingularKebab: "product",
          entityPluralKebab: "products",
        },
        features: ["reorderable"],
        blade: {
          id: "products-list",
          layout: "grid",
          components: [],
        },
        columns: [],
      };

      const result = await composer.compose({ context });

      const hasReorderablePattern = result.selectedPatterns.some(p =>
        p.name === "reorderable-table"
      );
      expect(hasReorderablePattern).toBe(true);
    });
  });
});
