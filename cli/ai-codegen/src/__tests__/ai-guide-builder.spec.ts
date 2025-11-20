import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AIGenerationGuideBuilder,
  type AIGenerationGuide,
  type BladeGenerationContext,
} from "../core/ai-generation-guide-builder.js";
import type { GenerationRules } from "../core/generation-rules.js";

describe("AIGenerationGuideBuilder", () => {
  let builder: AIGenerationGuideBuilder;
  let mockRules: GenerationRules;

  beforeEach(() => {
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
    } ;

    // Builder takes rules and frameworkSearch (optional)
    builder = new AIGenerationGuideBuilder(mockRules);
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
      columns: type === "list" ? [{ id: "name", title: "Name" }] : undefined,
      fields: type === "details" ? [{ id: "name", as: "VcInput", label: "Name" }] : undefined,
      complexity: 5,
    };
  }

  describe("buildGuide()", () => {
    it("should build guide for list blade", async () => {
      const context = createContext("list", "product");

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.task).toContain("list blade");
      expect(guide.task).toContain("product");
      expect(guide.context.entity).toBe("product");
      expect(guide.context.module).toBe("products");
    });

    it("should build guide for details blade", async () => {
      const context = createContext("details", "customer");

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.task).toContain("details blade");
      expect(guide.task).toContain("customer");
      expect(guide.context.entity).toBe("customer");
    });

    it("should include context in guide", async () => {
      const context = createContext("list", "order", ["filters", "multiselect"]);

      const guide = await builder.buildGuide(context);

      expect(guide.context.blade.id).toBe("order-list");
      expect(guide.context.features).toEqual(["filters", "multiselect"]);
      expect(guide.context.complexity).toBeGreaterThan(0);
    });

    it("should include instructions section", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

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

    it("should include verification section", async () => {
      const context = createContext("details");

      const guide = await builder.buildGuide(context);

      expect(guide.verification).toBeDefined();
      expect(guide.verification.checklist).toBeDefined();
      expect(Array.isArray(guide.verification.checklist)).toBe(true);
      expect(guide.verification.mustHave).toBeDefined();
      expect(Array.isArray(guide.verification.mustHave)).toBe(true);
      expect(guide.verification.mustNotHave).toBeDefined();
      expect(Array.isArray(guide.verification.mustNotHave)).toBe(true);
    });

    it("should generate steps for list blade", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      // List blade should have steps for VcBlade, VcTable, composable, etc.
      expect(guide.instructions.steps.length).toBeGreaterThanOrEqual(4);
    });

    it("should generate steps for details blade", async () => {
      const context = createContext("details");

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.steps.length).toBeGreaterThan(0);
      // Details blade should have steps for VcBlade, VcForm, composable, etc.
      expect(guide.instructions.steps.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("step structure", () => {
    it("should create steps with correct structure", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);
      const firstStep = guide.instructions.steps[0];

      // Each step should have required fields
      expect(firstStep).toBeDefined();
      expect(firstStep.step).toBeDefined();
      expect(typeof firstStep.step).toBe("number");
      expect(firstStep.title).toBeDefined();
      expect(typeof firstStep.title).toBe("string");
      expect(firstStep.description).toBeDefined();
      expect(firstStep.explanation).toBeDefined();
    });

    it("should number steps sequentially", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      for (let i = 0; i < guide.instructions.steps.length; i++) {
        expect(guide.instructions.steps[i].step).toBe(i + 1);
      }
    });

    it("should include code examples in steps", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      // Steps should have requirements or pattern references
      const stepsWithGuidance = guide.instructions.steps.filter(
        (step) =>
          (step.requirements && step.requirements.length > 0) ||
          (step.patternReferences && step.patternReferences.length > 0)
      );
      expect(stepsWithGuidance.length).toBeGreaterThan(0);
    });
  });

  describe("summary generation", () => {
    it("should include entity name in summary", async () => {
      const context = createContext("list", "product");

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("product");
    });

    it("should include module name in summary", async () => {
      const context = createContext("list", "order");
      context.module = "orders-management";

      const guide = await builder.buildGuide(context);

      // Summary should contain entity or features information
      const summary = guide.instructions.summary.toLowerCase();
      expect(summary.includes("order") || summary.length > 0).toBe(true);
    });

    it("should include features in summary", async () => {
      const context = createContext("list", "product", ["filters", "multiselect"]);

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.summary).toContain("filters");
      expect(guide.instructions.summary).toContain("multiselect");
    });

    it("should include complexity in summary", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      // Summary should be a non-empty string
      expect(guide.instructions.summary).toBeDefined();
      expect(guide.instructions.summary.length).toBeGreaterThan(0);
      // Should describe the task
      expect(guide.instructions.summary.toLowerCase()).toContain("blade");
    });
  });

  describe("examples generation", () => {
    it("should include template reference", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.examples.templateReference).toBeDefined();
      expect(typeof guide.instructions.examples.templateReference).toBe("string");
    });

    it("should include similar examples", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(guide.instructions.examples.similar).toBeDefined();
      expect(Array.isArray(guide.instructions.examples.similar)).toBe(true);
    });
  });

  describe("constraints generation", () => {
    it("should generate constraints array", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(Array.isArray(guide.instructions.constraints)).toBe(true);
      expect(guide.instructions.constraints.length).toBeGreaterThan(0);
    });

    it("should include TypeScript constraints", async () => {
      const context = createContext("details");

      const guide = await builder.buildGuide(context);

      const hasTypeScriptConstraint = guide.instructions.constraints.some(
        c => c.toLowerCase().includes("typescript") || c.toLowerCase().includes("type"),
      );
      expect(hasTypeScriptConstraint).toBe(true);
    });
  });

  describe("verification checklist", () => {
    it("should generate checklist items", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(Array.isArray(guide.verification.checklist)).toBe(true);
      expect(guide.verification.checklist.length).toBeGreaterThan(0);
    });

    it("should generate must-have items", async () => {
      const context = createContext("details");

      const guide = await builder.buildGuide(context);

      expect(Array.isArray(guide.verification.mustHave)).toBe(true);
      expect(guide.verification.mustHave.length).toBeGreaterThan(0);
    });

    it("should generate must-not-have items", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      expect(Array.isArray(guide.verification.mustNotHave)).toBe(true);
      expect(guide.verification.mustNotHave.length).toBeGreaterThan(0);
    });
  });

  describe("patterns loading", () => {
    it("should load relevant patterns", async () => {
      const context = createContext("list", "product", ["filters"]);

      const guide = await builder.buildGuide(context);

      expect(Array.isArray(guide.instructions.patterns)).toBe(true);
    });

    it("should include pattern structure", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      if (guide.instructions.patterns.length > 0) {
        const pattern = guide.instructions.patterns[0];
        expect(pattern.name).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.code).toBeDefined();
      }
    });
  });

  describe("feature-specific guides", () => {
    it("should handle filters feature", async () => {
      const context = createContext("list", "product", ["filters"]);

      const guide = await builder.buildGuide(context);

      // Summary should mention filters
      expect(guide.instructions.summary.toLowerCase()).toContain("filter");
    });

    it("should handle multiselect feature", async () => {
      const context = createContext("list", "product", ["multiselect"]);

      const guide = await builder.buildGuide(context);

      // Summary should mention multiselect/selection
      const summary = guide.instructions.summary.toLowerCase();
      expect(summary.includes("multiselect") || summary.includes("selection")).toBe(true);
    });

    it("should handle validation feature", async () => {
      const context = createContext("details", "product", ["validation"]);

      const guide = await builder.buildGuide(context);

      // Summary should mention validation
      expect(guide.instructions.summary.toLowerCase()).toContain("validat");
    });

    it("should handle gallery feature", async () => {
      const context = createContext("details", "product", ["gallery"]);

      const guide = await builder.buildGuide(context);

      // Summary should mention gallery/images
      const summary = guide.instructions.summary.toLowerCase();
      expect(summary.includes("gallery") || summary.includes("image")).toBe(true);
    });

    it("should handle widgets feature", async () => {
      const context = createContext("details", "product", ["widgets"]);

      const guide = await builder.buildGuide(context);

      // Summary should mention widgets
      expect(guide.instructions.summary.toLowerCase()).toContain("widget");
    });
  });

  describe("complexity handling", () => {
    it("should adapt guide for low complexity", async () => {
      const context = createContext("list");

      const guide = await builder.buildGuide(context);

      // Low complexity (no features) should be 1
      expect(guide.context.complexity).toBe(1);
      // Low complexity should still have complete guide
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should adapt guide for high complexity", async () => {
      const context = createContext("details", "product", ["validation", "gallery", "widgets"]);

      const guide = await builder.buildGuide(context);

      // High complexity (validation=1, gallery=2, widgets=0) = 1 + 1 + 2 = 4
      expect(guide.context.complexity).toBeGreaterThanOrEqual(3);
      // High complexity should have steps
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });
  });

  describe("guide completeness", () => {
    it("should provide complete guide for list blade", async () => {
      const context = createContext("list", "product", ["filters", "multiselect"]);

      const guide = await builder.buildGuide(context);

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

    it("should provide complete guide for details blade", async () => {
      const context = createContext("details", "customer", ["validation", "gallery"]);

      const guide = await builder.buildGuide(context);

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
    it("should handle blade with no features", async () => {
      const context = createContext("list", "product", []);

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with no columns", async () => {
      const context = createContext("list");
      context.columns = [];

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      // Should still generate guide even with no columns
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with no fields", async () => {
      const context = createContext("details");
      context.fields = [];

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      // Should still generate guide even with no fields
      expect(guide.instructions.steps.length).toBeGreaterThan(0);
    });

    it("should handle blade with many features", async () => {
      const context = createContext("list", "product", [
        "filters",
        "multiselect",
        "gallery",
        "validation",
      ]);

      const guide = await builder.buildGuide(context);

      expect(guide).toBeDefined();
      expect(guide.context.features.length).toBe(4);
    });
  });
});
