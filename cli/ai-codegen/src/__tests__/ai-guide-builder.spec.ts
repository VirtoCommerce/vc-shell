import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AIGenerationGuideBuilder,
  type AIGenerationGuide,
  type BladeGenerationContext,
} from "../core/ai-generation-guide-builder.js";
import type { ComponentRegistry } from "../core/component-registry.js";
import type { GenerationRules } from "../core/generation-rules.js";

describe("AIGenerationGuideBuilder", () => {
  let builder: AIGenerationGuideBuilder;
  let mockRegistry: ComponentRegistry;
  let mockRules: GenerationRules;

  beforeEach(() => {
    // Mock ComponentRegistry
    mockRegistry = {
      getComponent: vi.fn().mockReturnValue({
        name: "VcTable",
        description: "Table component",
        props: [],
        events: [],
        slots: [],
      }),
      getComponents: vi.fn().mockReturnValue([]),
      getAllComponents: vi.fn().mockReturnValue([]),
      searchComponents: vi.fn().mockReturnValue([]),
    } as any;

    // Mock GenerationRules
    mockRules = {
      vue: {
        structure: [],
        naming: [],
        imports: [],
        reactivity: [],
      },
      typescript: {
        typing: [],
        interfaces: [],
        generics: [],
      },
      framework: {
        components: [],
        composables: [],
        utilities: [],
      },
      patterns: [],
    } as any;

    builder = new AIGenerationGuideBuilder(mockRegistry, mockRules);
  });

  // Helper to create minimal context
  function createContext(
    type: "list" | "details",
    entity: string = "product",
    features: string[] = [],
  ): BladeGenerationContext {
    return {
      blade: {
        id: `${entity}-${type}`,
        layout: type === "list" ? "grid" : "details",
        title: `${entity} ${type}`,
        route: `/${entity}`,
      },
      type,
      entity,
      module: `${entity}s`,
      features,
      columns: type === "list" ? [{ key: "name", title: "Name" }] : undefined,
      fields: type === "details" ? [{ key: "name", as: "VcInput", label: "Name" }] : undefined,
      complexity: 5,
    };
  }

  describe("buildGuide()", () => {
    it("should build guide for list blade", () => {
      const context = createContext("list", "product");

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.task).toContain("list blade");
      expect(guide.task).toContain("product");
      expect(guide.context.entity).toBe("product");
      expect(guide.context.module).toBe("products");
    });

    it("should build guide for details blade", () => {
      const context = createContext("details", "customer");

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.task).toContain("details blade");
      expect(guide.task).toContain("customer");
      expect(guide.context.entity).toBe("customer");
    });

    it("should include context in guide", () => {
      const context = createContext("list", "order", ["filters", "multiselect"]);

      const guide = builder.buildGuide(context);

      expect(guide.context.blade.id).toBe("order-list");
      expect(guide.context.features).toEqual(["filters", "multiselect"]);
      expect(guide.context.complexity).toBe(5);
    });

    it("should include instructions section", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(guide.instructions).toBeDefined();
      expect(guide.instructions.summary).toBeDefined();
      expect(guide.instructions.steps).toBeDefined();
      expect(Array.isArray(guide.instructions.steps)).toBe(true);
      expect(guide.instructions.examples).toBeDefined();
      expect(guide.instructions.constraints).toBeDefined();
      expect(Array.isArray(guide.instructions.constraints)).toBe(true);
      expect(guide.instructions.patterns).toBeDefined();
      expect(Array.isArray(guide.instructions.patterns)).toBe(true);
    });

    it("should include verification section", () => {
      const context = createContext("details");

      const guide = builder.buildGuide(context);

      expect(guide.verification).toBeDefined();
      expect(guide.verification.checklist).toBeDefined();
      expect(Array.isArray(guide.verification.checklist)).toBe(true);
      expect(guide.verification.mustHave).toBeDefined();
      expect(Array.isArray(guide.verification.mustHave)).toBe(true);
      expect(guide.verification.mustNotHave).toBeDefined();
      expect(Array.isArray(guide.verification.mustNotHave)).toBe(true);
    });

    it("should generate steps for list blade", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      // List blade should have steps for VcBlade, VcTable, composable, etc.
      expect(guide.instructions.steps.length).toBeGreaterThanOrEqual(4);
    });

    it("should generate steps for details blade", () => {
      const context = createContext("details");

      const guide = builder.buildGuide(context);

      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      // Details blade should have steps for VcBlade, VcForm, composable, etc.
      expect(guide.instructions.steps.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("step structure", () => {
    it("should create steps with correct structure", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);
      const firstStep = guide.instructions.steps[0];

      // Each step should have required fields
      expect(firstStep.step).toBeDefined();
      expect(typeof firstStep.step).toBe("number");
      expect(firstStep.title).toBeDefined();
      expect(typeof firstStep.title).toBe("string");
      expect(firstStep.description).toBeDefined();
      expect(firstStep.code).toBeDefined();
      expect(firstStep.explanation).toBeDefined();
    });

    it("should number steps sequentially", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      for (let i = 0; i < guide.instructions.steps.length; i++) {
        expect(guide.instructions.steps[i].step).toBe(i + 1);
      }
    });

    it("should include code examples in steps", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      // Each step should have non-empty code
      for (const step of guide.instructions.steps) {
        expect(step.code.length).toBeGreaterThan(0);
      }
    });
  });

  describe("summary generation", () => {
    it("should include entity name in summary", () => {
      const context = createContext("list", "product");

      const guide = builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("product");
    });

    it("should include module name in summary", () => {
      const context = createContext("list", "order");
      context.module = "orders-management";

      const guide = builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("orders-management");
    });

    it("should include features in summary", () => {
      const context = createContext("list", "product", ["filters", "multiselect"]);

      const guide = builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("filters");
      expect(guide.instructions.summary).toContain("multiselect");
    });

    it("should include complexity in summary", () => {
      const context = createContext("list");
      context.complexity = 12;

      const guide = builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("12");
    });
  });

  describe("examples generation", () => {
    it("should include template reference", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(guide.instructions.examples.templateReference).toBeDefined();
      expect(typeof guide.instructions.examples.templateReference).toBe("string");
    });

    it("should include similar examples", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(guide.instructions.examples.similar).toBeDefined();
      expect(Array.isArray(guide.instructions.examples.similar)).toBe(true);
    });
  });

  describe("constraints generation", () => {
    it("should generate constraints array", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(Array.isArray(guide.instructions.constraints)).toBe(true);
      expect(guide.instructions.constraints.length).toBeGreaterThan(0);
    });

    it("should include TypeScript constraints", () => {
      const context = createContext("details");

      const guide = builder.buildGuide(context);

      const hasTypeScriptConstraint = guide.instructions.constraints.some(
        c => c.toLowerCase().includes("typescript") || c.toLowerCase().includes("type"),
      );
      expect(hasTypeScriptConstraint).toBe(true);
    });
  });

  describe("verification checklist", () => {
    it("should generate checklist items", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(Array.isArray(guide.verification.checklist)).toBe(true);
      expect(guide.verification.checklist.length).toBeGreaterThan(0);
    });

    it("should generate must-have items", () => {
      const context = createContext("details");

      const guide = builder.buildGuide(context);

      expect(Array.isArray(guide.verification.mustHave)).toBe(true);
      expect(guide.verification.mustHave.length).toBeGreaterThan(0);
    });

    it("should generate must-not-have items", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      expect(Array.isArray(guide.verification.mustNotHave)).toBe(true);
      expect(guide.verification.mustNotHave.length).toBeGreaterThan(0);
    });
  });

  describe("patterns loading", () => {
    it("should load relevant patterns", () => {
      const context = createContext("list", "product", ["filters"]);

      const guide = builder.buildGuide(context);

      expect(Array.isArray(guide.instructions.patterns)).toBe(true);
    });

    it("should include pattern structure", () => {
      const context = createContext("list");

      const guide = builder.buildGuide(context);

      if (guide.instructions.patterns.length > 0) {
        const pattern = guide.instructions.patterns[0];
        expect(pattern.name).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.code).toBeDefined();
      }
    });
  });

  describe("feature-specific guides", () => {
    it("should handle filters feature", () => {
      const context = createContext("list", "product", ["filters"]);

      const guide = builder.buildGuide(context);

      // Summary should mention filters
      expect(guide.instructions.summary.toLowerCase()).toContain("filter");
    });

    it("should handle multiselect feature", () => {
      const context = createContext("list", "product", ["multiselect"]);

      const guide = builder.buildGuide(context);

      // Summary should mention multiselect/selection
      const summary = guide.instructions.summary.toLowerCase();
      expect(summary.includes("multiselect") || summary.includes("selection")).toBe(true);
    });

    it("should handle validation feature", () => {
      const context = createContext("details", "product", ["validation"]);

      const guide = builder.buildGuide(context);

      // Summary should mention validation
      expect(guide.instructions.summary.toLowerCase()).toContain("validat");
    });

    it("should handle gallery feature", () => {
      const context = createContext("details", "product", ["gallery"]);

      const guide = builder.buildGuide(context);

      // Summary should mention gallery/images
      const summary = guide.instructions.summary.toLowerCase();
      expect(summary.includes("gallery") || summary.includes("image")).toBe(true);
    });

    it("should handle widgets feature", () => {
      const context = createContext("details", "product", ["widgets"]);

      const guide = builder.buildGuide(context);

      // Summary should mention widgets
      expect(guide.instructions.summary.toLowerCase()).toContain("widget");
    });
  });

  describe("complexity handling", () => {
    it("should adapt guide for low complexity", () => {
      const context = createContext("list");
      context.complexity = 3;

      const guide = builder.buildGuide(context);

      expect(guide.context.complexity).toBe(3);
      // Low complexity should still have complete guide
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should adapt guide for high complexity", () => {
      const context = createContext("details", "product", ["validation", "gallery", "widgets"]);
      context.complexity = 15;

      const guide = builder.buildGuide(context);

      expect(guide.context.complexity).toBe(15);
      // High complexity should have more detailed steps
      expect(guide.instructions.steps.length).toBeGreaterThan(4);
    });
  });

  describe("guide completeness", () => {
    it("should provide complete guide for list blade", () => {
      const context = createContext("list", "product", ["filters", "multiselect"]);

      const guide = builder.buildGuide(context);

      // Should have all required sections
      expect(guide.task).toBeTruthy();
      expect(guide.context).toBeTruthy();
      expect(guide.instructions.summary).toBeTruthy();
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      expect(guide.instructions.examples).toBeTruthy();
      expect(guide.instructions.constraints.length).toBeGreaterThan(0);
      expect(guide.verification.checklist.length).toBeGreaterThan(0);
      expect(guide.verification.mustHave.length).toBeGreaterThan(0);
      expect(guide.verification.mustNotHave.length).toBeGreaterThan(0);
    });

    it("should provide complete guide for details blade", () => {
      const context = createContext("details", "customer", ["validation", "gallery"]);

      const guide = builder.buildGuide(context);

      // Should have all required sections
      expect(guide.task).toBeTruthy();
      expect(guide.context).toBeTruthy();
      expect(guide.instructions.summary).toBeTruthy();
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      expect(guide.instructions.examples).toBeTruthy();
      expect(guide.instructions.constraints.length).toBeGreaterThan(0);
      expect(guide.verification.checklist.length).toBeGreaterThan(0);
      expect(guide.verification.mustHave.length).toBeGreaterThan(0);
      expect(guide.verification.mustNotHave.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle blade with no features", () => {
      const context = createContext("list", "product", []);

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with no columns", () => {
      const context = createContext("list");
      context.columns = [];

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      // Should still generate guide even with no columns
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with no fields", () => {
      const context = createContext("details");
      context.fields = [];

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      // Should still generate guide even with no fields
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with many features", () => {
      const context = createContext("list", "product", [
        "filters",
        "multiselect",
        "gallery",
        "validation",
      ]);

      const guide = builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.context.features.length).toBe(4);
    });
  });
});
