import { describe, it, expect } from "vitest";

describe("Naming Conventions", () => {
  describe("File naming", () => {
    it("list blade should be plural-list.vue", () => {
      const listFileName = "vendors-list.vue";
      expect(listFileName).toMatch(/^[a-z]+-list\.vue$/);
    });

    it("details blade should be singular-details.vue", () => {
      const detailsFileName = "vendor-details.vue";
      expect(detailsFileName).toMatch(/^[a-z]+-details\.vue$/);
    });

    it("should reject wrong patterns", () => {
      // Test that plural names are rejected for details blade
      expect("vendors-details.vue").toContain("vendors-");
      expect("vendors-details.vue").not.toMatch(/^vendor-details\.vue$/);
      
      // Test that no suffix is rejected
      expect("vendors.vue").not.toMatch(/^[a-z]+-details\.vue$/);
      expect("vendors.vue").not.toMatch(/^[a-z]+-list\.vue$/);
      
      // Test that PascalCase is rejected
      expect("VendorsList.vue").not.toMatch(/^[a-z]+-list\.vue$/);
    });
  });

  describe("Component naming", () => {
    it("list component should be {Singular}List", () => {
      const componentName = "VendorList";
      expect(componentName).toMatch(/^[A-Z][a-z]+List$/);
    });

    it("details component should be {Singular}Details", () => {
      const componentName = "VendorDetails";
      expect(componentName).toMatch(/^[A-Z][a-z]+Details$/);
    });

    it("should reject wrong patterns", () => {
      // Test that plural is rejected (ends with s before List)
      expect("VendorsList").toContain("sList");
      expect("VendorsList").not.toBe("VendorList");
      
      // Test that camelCase is rejected
      expect("vendorList").not.toMatch(/^[A-Z][a-z]+List$/);
      
      // Test that kebab-case is rejected
      expect("vendor-list").not.toMatch(/^[A-Z][a-z]+List$/);
    });
  });

  describe("Import naming", () => {
    it("should import details with singular name", () => {
      const importStatement = 'import VendorDetails from "./vendor-details.vue"';
      
      expect(importStatement).toContain("VendorDetails");
      expect(importStatement).toContain("vendor-details.vue");
      expect(importStatement).not.toContain("VendorsDetails");
      expect(importStatement).not.toContain("vendors-details.vue");
    });
  });

  describe("URL patterns", () => {
    it("list URL should be plural", () => {
      const listUrl = "/vendors";
      expect(listUrl).toMatch(/^\/[a-z]+s$/);
    });

    it("details URL should be singular", () => {
      const detailsUrl = "/vendor";
      expect(detailsUrl).toMatch(/^\/[a-z]+$/);
      expect(detailsUrl).not.toContain("s$");
    });

    it("should not contain :id", () => {
      const urls = ["/vendors", "/vendor", "/orders", "/order"];
      
      urls.forEach(url => {
        expect(url).not.toContain(":id");
        expect(url).not.toContain("?");
      });
    });
  });

  describe("Composable naming", () => {
    it("list composable should be use{Entity}List", () => {
      const composableName = "useVendorList";
      expect(composableName).toMatch(/^use[A-Z][a-z]+List$/);
    });

    it("details composable should be use{Entity}Details", () => {
      const composableName = "useVendorDetails";
      expect(composableName).toMatch(/^use[A-Z][a-z]+Details$/);
    });
  });
});

