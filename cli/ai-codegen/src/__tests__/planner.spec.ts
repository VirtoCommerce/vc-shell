/**
 * Planner Tests
 *
 * Tests for SmartUIPlanner - UI-Plan generation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SmartUIPlanner } from "../generators/planners/planner";

// Mock dependencies
const mockKb = {
  ensureLoaded: vi.fn().mockResolvedValue(undefined),
  components: {
    getAll: vi.fn().mockReturnValue([]),
  },
};

const mockComponentResolver = {
  resolveForBladeLayout: vi.fn().mockResolvedValue(null),
};

const mockFeatureResolver = {
  validate: vi.fn().mockResolvedValue({ valid: [], invalid: [] }),
};

describe("SmartUIPlanner", () => {
  let planner: SmartUIPlanner;

  beforeEach(() => {
    vi.clearAllMocks();
    planner = new SmartUIPlanner(
      mockKb as any,
      mockComponentResolver as any,
      mockFeatureResolver as any,
    );
  });

  describe("generatePlan", () => {
    it("should generate plan with correct module name", async () => {
      const analysis = {
        moduleName: "offers",
        description: "Offers management module",
        entities: [
          {
            name: "Offer",
            displayName: "Offer",
            properties: [{ name: "id", type: "string" }],
            blades: [{ type: "list", route: "/offers", isWorkspace: true, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.module).toBe("offers");
      expect(plan.description).toBe("Offers management module");
    });

    it("should generate list blade with VcTable component", async () => {
      const analysis = {
        moduleName: "vendors",
        description: "Vendors module",
        entities: [
          {
            name: "Vendor",
            displayName: "Vendor",
            properties: [
              { name: "id", type: "string" },
              { name: "name", type: "string" },
            ],
            blades: [{ type: "list", route: "/vendors", isWorkspace: true, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.blades).toHaveLength(1);
      expect(plan.blades[0].type).toBe("list");
      expect(plan.blades[0].component.type).toBe("VcTable");
    });

    it("should generate details blade with VcForm component", async () => {
      const analysis = {
        moduleName: "vendors",
        description: "Vendors module",
        entities: [
          {
            name: "Vendor",
            displayName: "Vendor",
            properties: [{ name: "name", type: "string" }],
            blades: [{ type: "details", route: "/vendors/details", isWorkspace: false, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.blades[0].type).toBe("details");
      expect(plan.blades[0].component.type).toBe("VcForm");
    });

    it("should use plural form for list blade ID", async () => {
      const analysis = {
        moduleName: "products",
        description: "Products module",
        entities: [
          {
            name: "Product",
            displayName: "Product",
            properties: [],
            blades: [{ type: "list", route: "/products", isWorkspace: true, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.blades[0].id).toBe("products-list");
    });

    it("should use singular form for details blade ID", async () => {
      const analysis = {
        moduleName: "products",
        description: "Products module",
        entities: [
          {
            name: "Product",
            displayName: "Product",
            properties: [],
            blades: [{ type: "details", route: "/products/details", isWorkspace: false, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.blades[0].id).toBe("product-details");
    });

    it("should use columns from bladeConfig when provided", async () => {
      const analysis = {
        moduleName: "offers",
        description: "Offers module",
        entities: [
          {
            name: "Offer",
            displayName: "Offer",
            properties: [
              { name: "id", type: "string" },
              { name: "name", type: "string" },
              { name: "price", type: "number" },
            ],
            blades: [
              {
                type: "list",
                route: "/offers",
                isWorkspace: true,
                features: [],
                columns: [
                  { id: "name", title: "Name", type: "text", sortable: true },
                  { id: "price", title: "Price", type: "number" },
                ],
              },
            ],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });
      const columns = plan.blades[0].component.props.columns as any[];

      expect(columns).toHaveLength(2);
      expect(columns[0].id).toBe("name");
      expect(columns[0].sortable).toBe(true);
      expect(columns[1].id).toBe("price");
    });

    it("should use fields from bladeConfig when provided", async () => {
      const analysis = {
        moduleName: "offers",
        description: "Offers module",
        entities: [
          {
            name: "Offer",
            displayName: "Offer",
            properties: [
              { name: "name", type: "string" },
              { name: "description", type: "string" },
            ],
            blades: [
              {
                type: "details",
                route: "/offers/details",
                isWorkspace: false,
                features: [],
                fields: [
                  { id: "name", label: "Name", component: "VcInput", required: true },
                  { id: "description", label: "Description", component: "VcTextarea" },
                ],
              },
            ],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });
      const fields = plan.blades[0].component.props.fields as any[];

      expect(fields).toHaveLength(2);
      expect(fields[0].key).toBe("name");
      expect(fields[0].as).toBe("VcInput");
      expect(fields[0].required).toBe(true);
      expect(fields[1].as).toBe("VcTextarea");
    });

    it("should map property types to column types", async () => {
      const analysis = {
        moduleName: "items",
        description: "Items module",
        entities: [
          {
            name: "Item",
            displayName: "Item",
            properties: [
              { name: "active", type: "boolean" },
              { name: "created", type: "date" },
              { name: "count", type: "number" },
            ],
            blades: [{ type: "list", route: "/items", isWorkspace: true, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });
      const columns = plan.blades[0].component.props.columns as any[];

      expect(columns.find((c: any) => c.id === "active")?.type).toBe("status-icon");
      expect(columns.find((c: any) => c.id === "created")?.type).toBe("date-ago");
      expect(columns.find((c: any) => c.id === "count")?.type).toBe("number");
    });

    it("should map property types to field components", async () => {
      const analysis = {
        moduleName: "items",
        description: "Items module",
        entities: [
          {
            name: "Item",
            displayName: "Item",
            properties: [
              { name: "name", type: "string" },
              { name: "active", type: "boolean" },
              { name: "tags", type: "array" },
            ],
            blades: [{ type: "details", route: "/items/details", isWorkspace: false, features: [] }],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });
      const fields = plan.blades[0].component.props.fields as any[];

      expect(fields.find((f: any) => f.key === "name")?.as).toBe("VcInput");
      expect(fields.find((f: any) => f.key === "active")?.as).toBe("VcSwitch");
      expect(fields.find((f: any) => f.key === "tags")?.as).toBe("VcMultivalue");
    });

    it("should generate localization keys for blades", async () => {
      const analysis = {
        moduleName: "orders",
        description: "Orders module",
        entities: [
          {
            name: "Order",
            displayName: "Order",
            properties: [],
            blades: [
              { type: "list", route: "/orders", isWorkspace: true, features: [] },
              { type: "details", route: "/orders/details", isWorkspace: false, features: [] },
            ],
          },
        ],
      };

      const plan = await planner.generatePlan({ analysis });

      expect(plan.localization.keys).toContain("orders-list.title");
      expect(plan.localization.keys).toContain("order-details.title");
    });
  });
});
