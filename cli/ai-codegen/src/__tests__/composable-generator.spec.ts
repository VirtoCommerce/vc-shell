import { describe, it, expect } from "vitest";
import { ComposableGenerator } from "../core/composable-generator";
import type { NamingConfig } from "../core/code-generator";

describe("ComposableGenerator", () => {
  const generator = new ComposableGenerator();

  const mockNaming: NamingConfig = {
    moduleName: "vendors",
    moduleNamePascal: "Vendors",
    moduleNameCamel: "vendors",
    moduleNameUpperSnake: "VENDORS",
    entitySingular: "vendor",
    entitySingularPascal: "Vendor",
    entitySingularCamel: "vendor",
    entitySingularKebab: "vendor",
    entityPlural: "vendors",
    entityPluralPascal: "Vendors",
    entityPluralCamel: "vendors",
    entityPluralKebab: "vendors",
  };

  describe("generateListComposable", () => {
    it("should generate list composable with mock data", () => {
      const result = generator.generateListComposable({
        naming: mockNaming,
        columns: [
          { key: "name", title: "Name" },
          { key: "email", title: "Email", type: "email" },
          { key: "status", title: "Status", type: "status" },
        ],
      });

      expect(result).toContain("export default function useVendorList");
      expect(result).toContain("export interface Vendor");
      expect(result).toContain("MOCK_VENDORS");
      expect(result).toContain("loadVendors");
      expect(result).toContain("deleteVendor");
      expect(result).toContain("email: string");
      expect(result).toContain("status: string");
    });

    it("should generate proper TypeScript interfaces", () => {
      const result = generator.generateListComposable({
        naming: mockNaming,
        columns: [
          { key: "name", title: "Name" },
          { key: "price", title: "Price", type: "money" },
          { key: "createdDate", title: "Created", type: "date-ago" },
        ],
      });

      expect(result).toContain("price: number");
      expect(result).toContain("createdDate: Date | string");
    });
  });

  describe("generateDetailsComposable", () => {
    it("should generate details composable with modification tracking", () => {
      const result = generator.generateDetailsComposable({
        naming: mockNaming,
        fields: [
          { key: "name", as: "VcInput", label: "Name", required: true },
          { key: "email", as: "VcInput", label: "Email", type: "email" },
        ],
      });

      expect(result).toContain("export default function useVendorDetails");
      expect(result).toContain("export interface Vendor");
      expect(result).toContain("loadVendor");
      expect(result).toContain("createVendor");
      expect(result).toContain("updateVendor");
      expect(result).toContain("deleteVendor");
      expect(result).toContain("resetModificationState");
      expect(result).toContain("modified");
      expect(result).toContain("watch");
    });

    it("should generate proper field types", () => {
      const result = generator.generateDetailsComposable({
        naming: mockNaming,
        fields: [
          { key: "active", as: "VcSwitch", label: "Active", type: "boolean" },
          { key: "count", as: "VcInput", label: "Count", type: "number" },
          { key: "startDate", as: "VcInput", label: "Start Date", type: "date" },
        ],
      });

      expect(result).toContain("active?: boolean");
      expect(result).toContain("count?: number");
      expect(result).toContain("startDate?: string | Date");
    });
  });
});

