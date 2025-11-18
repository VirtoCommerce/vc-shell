/**
 * Tests for PlannerV2 - Multi-Entity Support
 * Tests extended V2 capabilities
 */

import { describe, it, expect } from "vitest";
import { PlannerV2 } from "../core/planner-v2.js";
import type { PromptAnalysisV2 } from "../core/prompt-analyzer-v2.js";

describe("PlannerV2", () => {
  const planner = new PlannerV2();

  describe("generatePlan with V2 analysis", () => {
    it("should generate UI-Plan with multiple entities", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "order-management",
        entities: [
          {
            name: "orders",
            singular: "order",
            blades: [
              {
                type: "list",
                features: ["filters", "multiselect"],
                columns: [
                  { key: "orderNumber", title: "Order #" },
                  { key: "status", title: "Status", type: "status" },
                ],
              },
            ],
          },
          {
            name: "line-items",
            singular: "line-item",
            blades: [
              {
                type: "list",
                features: ["inline-editing"],
                columns: [
                  { key: "productName", title: "Product" },
                  { key: "quantity", title: "Qty" },
                ],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "complex",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.module).toBe("order-management");
      expect(plan.blades).toHaveLength(2);
      expect(plan.blades[0].id).toBe("orders-list");
      expect(plan.blades[1].id).toBe("line-items-list");
    });

    it("should support custom routes", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "vendors",
        entities: [
          {
            name: "vendors",
            singular: "vendor",
            blades: [
              {
                type: "list",
                route: "/vendors/pending",
                features: [],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "simple",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.blades[0].route).toBe("/vendors/pending");
    });

    it("should support custom actions", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "orders",
        entities: [
          {
            name: "orders",
            singular: "order",
            blades: [
              {
                type: "list",
                features: [],
                actions: [
                  { id: "approve", label: "Approve", type: "primary", icon: "fas fa-check" },
                  { id: "reject", label: "Reject", type: "danger", icon: "fas fa-times" },
                ],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "moderate",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.blades[0].customActions).toBeDefined();
      expect(plan.blades[0].customActions).toHaveLength(2);
      expect(plan.blades[0].customActions![0].id).toBe("approve");
    });

    it("should support custom permissions", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "products",
        entities: [
          {
            name: "products",
            singular: "product",
            blades: [
              {
                type: "list",
                features: [],
                permissions: ["products:read", "products:export"],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "simple",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.blades[0].permissions).toContain("products:read");
      expect(plan.blades[0].permissions).toContain("products:export");
    });

    it("should support dashboard blade type", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "analytics",
        entities: [
          {
            name: "products",
            singular: "product",
            blades: [
              {
                type: "dashboard",
                features: ["widgets", "real-time"],
              },
            ],
          },
        ],
        confidence: 0.85,
        complexity: "moderate",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.blades[0].layout).toBe("page");
      expect(plan.blades[0].features).toContain("widgets");
    });

    it("should support wizard blade type", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "products",
        entities: [
          {
            name: "products",
            singular: "product",
            blades: [
              {
                type: "wizard",
                features: ["validation"],
                fields: [
                  { key: "name", label: "Name", as: "VcInput", required: true },
                ],
              },
            ],
          },
        ],
        confidence: 0.9,
        complexity: "moderate",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect(plan.blades[0].layout).toBe("details");
      expect(plan.blades[0].components![0].mode).toBe("wizard");
    });

    it("should include workflow in plan", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "orders",
        entities: [
          {
            name: "orders",
            singular: "order",
            blades: [{ type: "details", features: [] }],
          },
        ],
        workflow: {
          type: "linear",
          steps: [
            { id: "create", title: "Create", bladeId: "order-details" },
            { id: "approve", title: "Approve", bladeId: "order-details" },
          ],
        },
        confidence: 0.9,
        complexity: "complex",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect((plan as any).workflow).toBeDefined();
      expect((plan as any).workflow.steps).toHaveLength(2);
    });

    it("should include globalFeatures in plan", () => {
      const analysis: PromptAnalysisV2 = {
        moduleName: "products",
        entities: [
          {
            name: "products",
            singular: "product",
            blades: [{ type: "list", features: [] }],
          },
        ],
        globalFeatures: [
          { name: "real-time", config: { updateInterval: 5000 } },
        ],
        confidence: 0.9,
        complexity: "moderate",
      };

      const plan = planner.generatePlan({ prompt: "", analysis });

      expect((plan as any).globalFeatures).toBeDefined();
      expect((plan as any).globalFeatures).toHaveLength(1);
    });
  });

  describe("fallback mode", () => {
    it("should extract multi-word entity names", () => {
      const plan = planner.generatePlan({ prompt: "Product management" });

      // V2 improvement: Extracts "product-management" instead of just "product"
      expect(plan.module).toBe("product-management");
      expect(plan.blades).toHaveLength(2);
      expect(plan.blades[0].id).toBe("product-management-list");
      expect(plan.blades[1].id).toBe("product-management-details");
    });

    it("should stop at action words", () => {
      const plan = planner.generatePlan({ prompt: "Vendor catalog with filtering" });

      // Should extract "vendor-catalog", stop at "with"
      expect(plan.module).toBe("vendor-catalog");
    });

    it("should handle single word prompts", () => {
      const plan = planner.generatePlan({ prompt: "Products" });

      expect(plan.module).toBe("products");
      expect(plan.blades).toHaveLength(2);
    });
  });
});
