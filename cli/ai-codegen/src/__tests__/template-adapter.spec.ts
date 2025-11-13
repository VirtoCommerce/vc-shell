import { describe, it, expect } from "vitest";
import { TemplateAdapter } from "../core/template-adapter";
import type { NamingConfig } from "../core/code-generator";

describe("TemplateAdapter", () => {
  const adapter = new TemplateAdapter();

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

  describe("adaptListTemplate", () => {
    it("should replace entity names in template", () => {
      const template = `<template>
  <VcBlade :title="title">
    <VcTable :items="items" />
  </VcBlade>
</template>

<script setup lang="ts">
import { default as useEntityList } from "../composables/useEntityList";

defineOptions({
  name: "EntityList",
  url: "/entities",
});

const { items } = useEntityList();
const title = "ENTITIES.PAGES.LIST.TITLE";
</script>
`;

      const result = adapter.adaptListTemplate(template, {
        naming: mockNaming,
        componentName: "VendorList",
        composableName: "useVendorList",
        route: "/vendors",
        menuTitleKey: "VENDORS.MENU.TITLE",
        isWorkspace: true,
      });

      expect(result).toContain("useVendorList");
      expect(result).toContain("VendorList");
      expect(result).toContain("/vendors");
      expect(result).toContain("VENDORS.PAGES.LIST.TITLE");
    });
  });

  describe("adaptDetailsTemplate", () => {
    it("should replace entity names in details template", () => {
      const template = `<template>
  <VcBlade :title="title">
    <VcForm>
      <Field name="name">
        <VcInput label="Name" />
      </Field>
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { default as useEntityDetails } from "../composables/useEntityDetails";

defineOptions({
  name: "EntityDetails",
  url: "/entity",
});

const { item } = useEntityDetails();
</script>
`;

      const result = adapter.adaptDetailsTemplate(template, {
        naming: mockNaming,
        componentName: "VendorDetails",
        composableName: "useVendorDetails",
        route: "/vendor",
        menuTitleKey: "VENDORS.MENU.TITLE",
      });

      expect(result).toContain("useVendorDetails");
      expect(result).toContain("VendorDetails");
      expect(result).toContain("/vendor");
    });
  });
});
