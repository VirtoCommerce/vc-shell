import { describe, it, expect, beforeAll } from "vitest";
import { UnifiedCodeGenerator } from "../core/unified-generator";
import type { UIPlan } from "../core/validator";

describe("UnifiedCodeGenerator", () => {
  let generator: UnifiedCodeGenerator;

  beforeAll(() => {
    generator = new UnifiedCodeGenerator();
  });

  describe("generateModule", () => {
    it("should generate complete module from UI-Plan with list blade", async () => {
      const plan: UIPlan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "vendors",
        blades: [
          {
            id: "vendors-list",
            route: "/vendors",
            layout: "grid",
            title: "Vendors",
            isWorkspace: true,
            components: [
              {
                type: "VcTable",
                columns: [
                  { key: "name", title: "Name", sortable: true },
                  { key: "email", title: "Email" },
                  { key: "status", title: "Status" },
                ],
              },
            ],
          },
        ],
      };

      const result = await generator.generateModule(plan, "/tmp/test-project");

      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.summary.blades).toBe(1);
      expect(result.summary.composables).toBe(1);
      expect(result.summary.locales).toBe(2);

      // Check blade file generated
      const bladeFile = result.files.find(f => f.path.includes("vendors-list.vue"));
      expect(bladeFile).toBeDefined();
      expect(bladeFile?.content).toContain("VcBlade");
      expect(bladeFile?.content).toContain("VcTable");
      expect(bladeFile?.content).toContain("VendorList");

      // Check composable file generated
      const composableFile = result.files.find(f => f.path.includes("useVendorList"));
      expect(composableFile).toBeDefined();
      expect(composableFile?.content).toContain("export default function useVendorList");
      expect(composableFile?.content).toContain("MOCK_VENDORS");
    });

    it("should generate module with both list and details blades", async () => {
      const plan: UIPlan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "products",
        blades: [
          {
            id: "products-list",
            route: "/products",
            layout: "grid",
            title: "Products",
            isWorkspace: true,
            components: [
              {
                type: "VcTable",
                columns: [{ key: "name", title: "Name" }],
              },
            ],
          },
          {
            id: "product-details",
            route: "/product",
            layout: "details",
            title: "Product Details",
            components: [
              {
                type: "VcForm",
                fields: [
                  { key: "name", as: "VcInput", label: "Name", required: true },
                  { key: "price", as: "VcInput", label: "Price", type: "number" },
                ],
              },
            ],
          },
        ],
      };

      const result = await generator.generateModule(plan, "/tmp/test-project");

      expect(result.files).toBeDefined();
      expect(result.summary.blades).toBe(2);
      expect(result.summary.composables).toBe(2);

      // Check list blade
      const listBlade = result.files.find(f => f.path.includes("products-list.vue"));
      expect(listBlade).toBeDefined();
      expect(listBlade?.content).toContain("ProductList");

      // Check details blade
      const detailsBlade = result.files.find(f => f.path.includes("product-details.vue"));
      expect(detailsBlade).toBeDefined();
      expect(detailsBlade?.content).toContain("ProductDetails");

      // Check composables
      const listComposable = result.files.find(f => f.path.includes("useProductList"));
      expect(listComposable).toBeDefined();

      const detailsComposable = result.files.find(f => f.path.includes("useProductDetails"));
      expect(detailsComposable).toBeDefined();
    });

    it("should generate proper locale structure", async () => {
      const plan: UIPlan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "orders",
        blades: [
          {
            id: "orders-list",
            route: "/orders",
            layout: "grid",
            title: "Orders",
            isWorkspace: true,
            components: [
              {
                type: "VcTable",
                columns: [{ key: "number", title: "Order Number" }],
              },
            ],
          },
        ],
      };

      const result = await generator.generateModule(plan, "/tmp/test-project");

      // Find locale file
      const localeFile = result.files.find(f => f.path.includes("locales/en.json"));
      expect(localeFile).toBeDefined();

      const locale = JSON.parse(localeFile!.content);
      expect(locale).toHaveProperty("ORDERS");
      expect(locale.ORDERS).toHaveProperty("MENU");
      expect(locale.ORDERS).toHaveProperty("PAGES");
      expect(locale.ORDERS.PAGES).toHaveProperty("LIST");
    });

    it("should generate module files (index.ts, pages/index.ts)", async () => {
      const plan: UIPlan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "vendors",
        blades: [
          {
            id: "vendors-list",
            route: "/vendors",
            layout: "grid",
            title: "Vendors",
            components: [{ type: "VcTable", columns: [] }],
          },
        ],
      };

      const result = await generator.generateModule(plan, "/tmp/test-project");

      // Check module index.ts
      const moduleIndex = result.files.find(f => f.path.endsWith("vendors/index.ts"));
      expect(moduleIndex).toBeDefined();
      expect(moduleIndex?.content).toContain("createAppModule");

      // Check pages/index.ts
      const pagesIndex = result.files.find(f => f.path.includes("pages/index.ts"));
      expect(pagesIndex).toBeDefined();
      expect(pagesIndex?.content).toContain("export { default as VendorList }");
    });

    it("should include helper components when advanced list features are requested", async () => {
      const plan: UIPlan = {
        $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
        module: "inventory",
        blades: [
          {
            id: "inventory-list",
            route: "/inventory",
            layout: "grid",
            title: "Inventory",
            features: ["multiselect"],
            components: [
              {
                type: "VcTable",
                columns: [
                  { key: "sku", title: "SKU" },
                  { key: "status", title: "Status", type: "status" }, // status column triggers StatusBadge component
                ],
              },
            ],
          },
        ],
      };

      const result = await generator.generateModule(plan, "/tmp/test-project");

      const statusBadge = result.files.find(f => f.path.includes("components/status-badge.vue"));
      expect(statusBadge).toBeDefined();
      expect(statusBadge?.content).toContain("VcStatus");

      const componentsIndex = result.files.find(f => f.path.includes("components/index.ts"));
      expect(componentsIndex).toBeDefined();
      expect(componentsIndex?.content).toContain("StatusBadge");
    });
  });
});

