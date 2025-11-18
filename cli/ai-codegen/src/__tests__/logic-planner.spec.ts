import { describe, it, expect, beforeEach } from "vitest";
import { LogicPlanner, type BladeLogic, type ComposableDefinition } from "../core/logic-planner.js";
import type { Blade } from "../core/validator.js";

describe("LogicPlanner", () => {
  let planner: LogicPlanner;

  beforeEach(() => {
    planner = new LogicPlanner();
  });

  // Helper to create minimal blade
  function createBlade(
    id: string,
    layout: "grid" | "details",
    features: string[] = [],
  ): Blade {
    return {
      id,
      layout,
      route: `/${id}`,
      components: [],
      features,
    };
  }

  describe("inferLogic()", () => {
    describe("list blade", () => {
      it("should infer basic list blade logic", () => {
        const blade = createBlade("products-list", "grid");

        const logic = planner.inferLogic(blade);

        // Should have onItemClick handler
        expect(logic.handlers.onItemClick).toBeDefined();
        expect(logic.handlers.onItemClick).toContain("openBlade");
        expect(logic.handlers.onItemClick).toContain("ProductsDetails"); // Note: "products" becomes "ProductsDetails"

        // Should have refresh and add toolbar actions
        expect(logic.toolbar).toHaveLength(2);
        expect(logic.toolbar[0].id).toBe("refresh");
        expect(logic.toolbar[1].id).toBe("add");

        // Should have items, loading, totalCount state
        expect(logic.state.items).toBeDefined();
        expect(logic.state.loading).toBeDefined();
        expect(logic.state.totalCount).toBeDefined();
        expect(logic.state.selectedItemId).toBeDefined();
      });

      it("should infer filters feature logic", () => {
        const blade = createBlade("products-list", "grid", ["filters"]);

        const logic = planner.inferLogic(blade);

        // Should have onApplyFilters handler
        expect(logic.handlers.onApplyFilters).toBeDefined();
        expect(logic.handlers.onApplyFilters).toContain("appliedFilters");

        // Should have filter state
        expect(logic.state.stagedFilters).toBeDefined();
        expect(logic.state.stagedFilters.source).toBe("local");
        expect(logic.state.appliedFilters).toBeDefined();
        expect(logic.state.appliedFilters.source).toBe("composable");
      });

      it("should infer multiselect feature logic", () => {
        const blade = createBlade("products-list", "grid", ["multiselect"]);

        const logic = planner.inferLogic(blade);

        // Should have multiselect handlers
        expect(logic.handlers.onSelectionChange).toBeDefined();
        expect(logic.handlers.onDelete).toBeDefined();

        // Should have delete-selected toolbar action
        const deleteAction = logic.toolbar.find(t => t.id === "delete-selected");
        expect(deleteAction).toBeDefined();
        expect(deleteAction?.condition).toBe("selectedItems.length > 0");

        // Should have selectedItems state
        expect(logic.state.selectedItems).toBeDefined();
        expect(logic.state.selectedItems.source).toBe("local");
        expect(logic.state.selectedItems.default).toEqual([]);
      });

      it("should infer gallery feature logic", () => {
        const blade = createBlade("products-list", "grid", ["gallery"]);

        const logic = planner.inferLogic(blade);

        // Should have onImageClick handler
        expect(logic.handlers.onImageClick).toBeDefined();
        expect(logic.handlers.onImageClick).toContain("openImagePreview");

        // Should have selectedImage state
        expect(logic.state.selectedImage).toBeDefined();
        expect(logic.state.selectedImage.source).toBe("local");
        expect(logic.state.selectedImage.default).toBe(null);
      });

      it("should combine multiple features", () => {
        const blade = createBlade("products-list", "grid", ["filters", "multiselect"]);

        const logic = planner.inferLogic(blade);

        // Should have handlers from both features
        expect(logic.handlers.onApplyFilters).toBeDefined();
        expect(logic.handlers.onSelectionChange).toBeDefined();

        // Should have state from both features
        expect(logic.state.stagedFilters).toBeDefined();
        expect(logic.state.selectedItems).toBeDefined();

        // Should have toolbar from both features
        expect(logic.toolbar.find(t => t.id === "delete-selected")).toBeDefined();
      });
    });

    describe("details blade", () => {
      it("should infer basic details blade logic", () => {
        const blade = createBlade("product-details", "details");

        const logic = planner.inferLogic(blade);

        // Should have onSave handler
        expect(logic.handlers.onSave).toBeDefined();
        expect(logic.handlers.onSave).toBe("validateAndSave()");

        // Should have save, save-and-close, cancel toolbar actions
        expect(logic.toolbar).toHaveLength(3);
        expect(logic.toolbar[0].id).toBe("save");
        expect(logic.toolbar[1].id).toBe("save-and-close");
        expect(logic.toolbar[2].id).toBe("cancel");

        // Should have item, loading, modified state
        expect(logic.state.item).toBeDefined();
        expect(logic.state.loading).toBeDefined();
        expect(logic.state.modified).toBeDefined();
        expect(logic.state.modified.default).toBe(false);
      });

      it("should infer validation feature logic", () => {
        const blade = createBlade("product-details", "details", ["validation"]);

        const logic = planner.inferLogic(blade);

        // Should have onValidate handler
        expect(logic.handlers.onValidate).toBeDefined();
        expect(logic.handlers.onValidate).toBe("validateForm()");

        // Should have validation state
        expect(logic.state.errors).toBeDefined();
        expect(logic.state.errors.default).toEqual({});
        expect(logic.state.validating).toBeDefined();
        expect(logic.state.validating.default).toBe(false);
      });

      it("should infer gallery feature logic", () => {
        const blade = createBlade("product-details", "details", ["gallery"]);

        const logic = planner.inferLogic(blade);

        // Should have gallery handlers
        expect(logic.handlers.onImageUpload).toBeDefined();
        expect(logic.handlers.onImageDelete).toBeDefined();

        // Should have gallery state
        expect(logic.state.images).toBeDefined();
        expect(logic.state.images.default).toEqual([]);
        expect(logic.state.uploading).toBeDefined();
        expect(logic.state.uploading.default).toBe(false);
      });

      it("should combine multiple features", () => {
        const blade = createBlade("product-details", "details", ["validation", "gallery"]);

        const logic = planner.inferLogic(blade);

        // Should have handlers from both features
        expect(logic.handlers.onValidate).toBeDefined();
        expect(logic.handlers.onImageUpload).toBeDefined();

        // Should have state from both features
        expect(logic.state.errors).toBeDefined();
        expect(logic.state.images).toBeDefined();
      });
    });
  });

  describe("inferComposable()", () => {
    it("should infer list composable", () => {
      const blade = createBlade("products-list", "grid");

      const composable = planner.inferComposable(blade);

      expect(composable.name).toBe("useProductsList"); // Note: extracted name is "products"
      expect(composable.methods).toContain("load");
      expect(composable.methods).toContain("reload");
      expect(composable.methods).toContain("search");
      expect(composable.methods).toContain("deleteItem");
      expect(composable.mockData).toBe(true);
    });

    it("should infer details composable", () => {
      const blade = createBlade("product-details", "details");

      const composable = planner.inferComposable(blade);

      expect(composable.name).toBe("useProductDetails");
      expect(composable.methods).toContain("load");
      expect(composable.methods).toContain("save");
      expect(composable.methods).toContain("reset");
      expect(composable.mockData).toBe(true);
    });

    it("should add filter methods for filters feature", () => {
      const blade = createBlade("products-list", "grid", ["filters"]);

      const composable = planner.inferComposable(blade);

      expect(composable.methods).toContain("applyFilters");
      expect(composable.methods).toContain("clearFilters");
    });

    it("should add multiselect methods for multiselect feature", () => {
      const blade = createBlade("products-list", "grid", ["multiselect"]);

      const composable = planner.inferComposable(blade);

      expect(composable.methods).toContain("deleteSelectedItems");
    });

    it("should add validation methods for validation feature", () => {
      const blade = createBlade("product-details", "details", ["validation"]);

      const composable = planner.inferComposable(blade);

      expect(composable.methods).toContain("validate");
    });

    it("should add gallery methods for gallery feature", () => {
      const blade = createBlade("product-details", "details", ["gallery"]);

      const composable = planner.inferComposable(blade);

      expect(composable.methods).toContain("uploadImage");
      expect(composable.methods).toContain("deleteImage");
    });

    it("should use provided naming config", () => {
      const blade = createBlade("entity-list", "grid");
      const naming = {
        entitySingularCamel: "customer",
        entitySingularPascal: "Customer",
      };

      const composable = planner.inferComposable(blade, naming);

      expect(composable.name).toBe("useCustomerList");
    });
  });

  describe("mergeLogic()", () => {
    it("should return inferred logic when no provided logic", () => {
      const inferred: BladeLogic = {
        handlers: { onSave: "save()" },
        toolbar: [{ id: "save", icon: "fas fa-save", action: "save()" }],
        state: { loading: { source: "composable", reactive: true } },
      };

      const merged = planner.mergeLogic(inferred);

      expect(merged).toEqual(inferred);
    });

    it("should merge handlers", () => {
      const inferred: BladeLogic = {
        handlers: { onSave: "inferred_save()" },
        toolbar: [],
        state: {},
      };

      const provided: Partial<BladeLogic> = {
        handlers: { onSave: "custom_save()", onCancel: "cancel()" },
      };

      const merged = planner.mergeLogic(inferred, provided);

      // Provided handlers should override inferred
      expect(merged.handlers.onSave).toBe("custom_save()");
      expect(merged.handlers.onCancel).toBe("cancel()");
    });

    it("should replace toolbar completely if provided", () => {
      const inferred: BladeLogic = {
        handlers: {},
        toolbar: [
          { id: "save", icon: "fas fa-save", action: "save()" },
          { id: "cancel", icon: "fas fa-times", action: "cancel()" },
        ],
        state: {},
      };

      const provided: Partial<BladeLogic> = {
        toolbar: [{ id: "custom", icon: "fas fa-star", action: "custom()" }],
      };

      const merged = planner.mergeLogic(inferred, provided);

      // Toolbar should be completely replaced
      expect(merged.toolbar).toHaveLength(1);
      expect(merged.toolbar[0].id).toBe("custom");
    });

    it("should merge state definitions", () => {
      const inferred: BladeLogic = {
        handlers: {},
        toolbar: [],
        state: {
          loading: { source: "composable", reactive: true },
          items: { source: "composable", reactive: true },
        },
      };

      const provided: Partial<BladeLogic> = {
        state: {
          loading: { source: "local", reactive: false }, // Override
          customState: { source: "local", reactive: true, default: "test" }, // Add
        },
      };

      const merged = planner.mergeLogic(inferred, provided);

      // loading should be overridden
      expect(merged.state.loading.source).toBe("local");
      // items should remain from inferred
      expect(merged.state.items.source).toBe("composable");
      // customState should be added
      expect(merged.state.customState).toBeDefined();
      expect(merged.state.customState.default).toBe("test");
    });
  });

  describe("describeLogic()", () => {
    it("should describe handlers", () => {
      const logic: BladeLogic = {
        handlers: {
          onSave: "save()",
          onCancel: "cancel()",
        },
        toolbar: [],
        state: {},
      };

      const description = planner.describeLogic(logic);

      expect(description).toContain("Event Handlers:");
      expect(description).toContain("onSave: save()");
      expect(description).toContain("onCancel: cancel()");
    });

    it("should describe toolbar actions", () => {
      const logic: BladeLogic = {
        handlers: {},
        toolbar: [
          { id: "save", icon: "fas fa-save", action: "save()" },
          { id: "delete", icon: "fas fa-trash", action: "delete()", condition: "item.id" },
        ],
        state: {},
      };

      const description = planner.describeLogic(logic);

      expect(description).toContain("Toolbar Actions:");
      expect(description).toContain("save: save()");
      expect(description).toContain("delete: delete() (when: item.id)");
    });

    it("should describe state", () => {
      const logic: BladeLogic = {
        handlers: {},
        toolbar: [],
        state: {
          loading: { source: "composable", reactive: true },
          items: { source: "composable", reactive: true },
          selectedId: { source: "local", reactive: true, default: null },
        },
      };

      const description = planner.describeLogic(logic);

      expect(description).toContain("State Management:");
      expect(description).toContain("loading: from composable");
      expect(description).toContain("items: from composable");
      expect(description).toContain("selectedId: local (default: null)");
    });

    it("should describe complete logic", () => {
      const blade = createBlade("products-list", "grid", ["filters"]);
      const logic = planner.inferLogic(blade);

      const description = planner.describeLogic(logic);

      expect(description).toContain("Blade Logic:");
      expect(description).toContain("Event Handlers:");
      expect(description).toContain("Toolbar Actions:");
      expect(description).toContain("State Management:");
    });
  });

  describe("entity name extraction", () => {
    it("should extract entity from list blade ID", () => {
      const blade = createBlade("products-list", "grid");
      const composable = planner.inferComposable(blade);

      // Note: Extracted name is "products" (plural) - the implementation doesn't singularize
      expect(composable.name).toBe("useProductsList");
    });

    it("should extract entity from details blade ID", () => {
      const blade = createBlade("product-details", "details");
      const composable = planner.inferComposable(blade);

      expect(composable.name).toBe("useProductDetails");
    });

    it("should extract entity from grid blade ID", () => {
      const blade = createBlade("orders-grid", "grid");
      const composable = planner.inferComposable(blade);

      // Note: Extracted name is "orders" (plural)
      expect(composable.name).toBe("useOrdersList");
    });

    it("should extract entity from form blade ID", () => {
      const blade = createBlade("customer-form", "details");
      const composable = planner.inferComposable(blade);

      expect(composable.name).toBe("useCustomerDetails");
    });

    it("should handle multi-word entity names", () => {
      const blade = createBlade("product-categories-list", "grid");
      const composable = planner.inferComposable(blade);

      // Note: camelCase("product-categories") = "productCategories" (keeps plural)
      expect(composable.name).toBe("useProductCategoriesList");
    });

    it("should handle kebab-case entity names", () => {
      const blade = createBlade("vendor-products-list", "grid");
      const composable = planner.inferComposable(blade);

      // Note: camelCase("vendor-products") = "vendorProducts" (keeps plural)
      expect(composable.name).toBe("useVendorProductsList");
    });
  });

  describe("toolbar action structure", () => {
    it("should create toolbar actions with correct structure", () => {
      const blade = createBlade("products-list", "grid");
      const logic = planner.inferLogic(blade);

      const refreshAction = logic.toolbar[0];
      expect(refreshAction.id).toBe("refresh");
      expect(refreshAction.icon).toBe("fas fa-sync");
      expect(refreshAction.title).toBe("pages.products.toolbar.refresh");
      expect(refreshAction.action).toBe("load()");
      expect(refreshAction.condition).toBeUndefined();
    });

    it("should create conditional toolbar actions", () => {
      const blade = createBlade("products-list", "grid", ["multiselect"]);
      const logic = planner.inferLogic(blade);

      const deleteAction = logic.toolbar.find(t => t.id === "delete-selected");
      expect(deleteAction).toBeDefined();
      expect(deleteAction?.condition).toBe("selectedItems.length > 0");
    });

    it("should use kebab-case for i18n keys", () => {
      const blade = createBlade("vendor-products-list", "grid");
      const logic = planner.inferLogic(blade);

      expect(logic.toolbar[0].title).toBe("pages.vendor-products.toolbar.refresh");
    });
  });

  describe("state definition structure", () => {
    it("should create state with correct structure", () => {
      const blade = createBlade("products-list", "grid");
      const logic = planner.inferLogic(blade);

      expect(logic.state.items.source).toBe("composable");
      expect(logic.state.items.reactive).toBe(true);
      expect(logic.state.items.description).toBeDefined();

      expect(logic.state.selectedItemId.source).toBe("local");
      expect(logic.state.selectedItemId.reactive).toBe(true);
      expect(logic.state.selectedItemId.default).toBe(undefined);
    });

    it("should set default values for local state", () => {
      const blade = createBlade("products-list", "grid", ["multiselect", "filters"]);
      const logic = planner.inferLogic(blade);

      // Local state should have defaults
      expect(logic.state.selectedItems.default).toEqual([]);
      expect(logic.state.stagedFilters.default).toEqual({});

      // Composable state should not have defaults
      expect(logic.state.items.default).toBeUndefined();
      expect(logic.state.loading.default).toBeUndefined();
    });
  });

  describe("handler generation", () => {
    it("should generate list blade handlers with parent-child callbacks", () => {
      const blade = createBlade("products-list", "grid");
      const logic = planner.inferLogic(blade);

      // Should include onOpen and onClose callbacks for parent-child communication
      expect(logic.handlers.onItemClick).toContain("onOpen:");
      expect(logic.handlers.onItemClick).toContain("onClose:");
      expect(logic.handlers.onItemClick).toContain("selectedItemId.value = item.id");
      expect(logic.handlers.onItemClick).toContain("selectedItemId.value = undefined");
      expect(logic.handlers.onItemClick).toContain("load()");
    });

    it("should use markRaw for blade references", () => {
      const blade = createBlade("products-list", "grid");
      const logic = planner.inferLogic(blade);

      // Note: "products" becomes "ProductsDetails"
      expect(logic.handlers.onItemClick).toContain("markRaw(ProductsDetails)");
      expect(logic.toolbar[1].action).toContain("markRaw(ProductsDetails)");
    });

    it("should generate filter handlers", () => {
      const blade = createBlade("products-list", "grid", ["filters"]);
      const logic = planner.inferLogic(blade);

      expect(logic.handlers.onApplyFilters).toBe("appliedFilters.value = stagedFilters.value; load()");
    });
  });

  describe("new features support (export, import, pagination, etc.)", () => {
    describe("export feature", () => {
      it("should generate export handler for list blade", () => {
        const blade = createBlade("products-list", "grid", ["export"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onExport).toBe("exportData(items.value, exportFormat.value)");
      });

      it("should add export button to toolbar", () => {
        const blade = createBlade("products-list", "grid", ["export"]);
        const logic = planner.inferLogic(blade);

        const exportButton = logic.toolbar.find((t) => t.id === "export");
        expect(exportButton).toBeDefined();
        expect(exportButton?.icon).toBe("fas fa-download");
        expect(exportButton?.action).toBe("onExport()");
      });

      it("should add exportFormat state", () => {
        const blade = createBlade("products-list", "grid", ["export"]);
        const logic = planner.inferLogic(blade);

        expect(logic.state.exportFormat).toBeDefined();
        expect(logic.state.exportFormat.source).toBe("local");
        expect(logic.state.exportFormat.reactive).toBe(true);
        expect(logic.state.exportFormat.default).toBe("csv");
      });
    });

    describe("import feature", () => {
      it("should generate import handlers for list blade", () => {
        const blade = createBlade("products-list", "grid", ["import"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onImport).toBe("importData(file)");
        expect(logic.handlers.onImportComplete).toBe("load()");
      });

      it("should add import button to toolbar", () => {
        const blade = createBlade("products-list", "grid", ["import"]);
        const logic = planner.inferLogic(blade);

        const importButton = logic.toolbar.find((t) => t.id === "import");
        expect(importButton).toBeDefined();
        expect(importButton?.icon).toBe("fas fa-upload");
        expect(importButton?.action).toBe("onImport()");
      });

      it("should add import progress state", () => {
        const blade = createBlade("products-list", "grid", ["import"]);
        const logic = planner.inferLogic(blade);

        expect(logic.state.importing).toBeDefined();
        expect(logic.state.importing.default).toBe(false);
        expect(logic.state.importProgress).toBeDefined();
        expect(logic.state.importProgress.default).toBe(0);
      });
    });

    describe("pagination feature", () => {
      it("should generate pagination handlers for list blade", () => {
        const blade = createBlade("products-list", "grid", ["pagination"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onPageChange).toBe("currentPage.value = page; load()");
        expect(logic.handlers.onPageSizeChange).toBe("pageSize.value = size; currentPage.value = 1; load()");
      });

      it("should add pagination state from composable", () => {
        const blade = createBlade("products-list", "grid", ["pagination"]);
        const logic = planner.inferLogic(blade);

        expect(logic.state.currentPage).toBeDefined();
        expect(logic.state.currentPage.source).toBe("composable");
        expect(logic.state.pageSize).toBeDefined();
        expect(logic.state.pageSize.source).toBe("composable");
        expect(logic.state.totalPages).toBeDefined();
        expect(logic.state.totalPages.source).toBe("composable");
      });
    });

    describe("reorderable feature", () => {
      it("should generate reorder handler for list blade", () => {
        const blade = createBlade("products-list", "grid", ["reorderable"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onReorder).toBe("reorderItems(fromIndex, toIndex); saveOrder()");
      });
    });

    describe("inline-editing feature", () => {
      it("should generate inline editing handlers for list blade", () => {
        const blade = createBlade("products-list", "grid", ["inline-editing"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onCellEdit).toBe("updateCell(item.id, field, value)");
        expect(logic.handlers.onRowSave).toBe("saveRow(item.id)");
      });

      it("should add editingCells state", () => {
        const blade = createBlade("products-list", "grid", ["inline-editing"]);
        const logic = planner.inferLogic(blade);

        expect(logic.state.editingCells).toBeDefined();
        expect(logic.state.editingCells.source).toBe("local");
        expect(logic.state.editingCells.reactive).toBe(true);
        expect(logic.state.editingCells.default).toEqual({});
      });
    });

    describe("widgets feature", () => {
      it("should generate widget handlers for details blade", () => {
        const blade = createBlade("product-details", "details", ["widgets"]);
        const logic = planner.inferLogic(blade);

        expect(logic.handlers.onWidgetRefresh).toBe("refreshWidget(widgetId)");
        expect(logic.handlers.onWidgetConfigure).toBe("configureWidget(widgetId)");
      });

      it("should work with list blade (dashboard scenario)", () => {
        const blade = createBlade("products-dashboard", "grid", ["widgets"]);
        const logic = planner.inferLogic(blade);

        // Should not generate widget handlers for list blades
        expect(logic.handlers.onWidgetRefresh).toBeUndefined();
        expect(logic.handlers.onWidgetConfigure).toBeUndefined();
      });
    });

    describe("real-time feature", () => {
      it("should add real-time connection state for list blade", () => {
        const blade = createBlade("products-list", "grid", ["real-time"]);
        const logic = planner.inferLogic(blade);

        expect(logic.state.wsConnected).toBeDefined();
        expect(logic.state.wsConnected.source).toBe("local");
        expect(logic.state.wsConnected.default).toBe(false);
        expect(logic.state.lastUpdate).toBeDefined();
        expect(logic.state.lastUpdate.default).toBe(null);
      });
    });

    describe("multiple features combined", () => {
      it("should support export + import + pagination together", () => {
        const blade = createBlade("products-list", "grid", ["export", "import", "pagination"]);
        const logic = planner.inferLogic(blade);

        // Handlers
        expect(logic.handlers.onExport).toBeDefined();
        expect(logic.handlers.onImport).toBeDefined();
        expect(logic.handlers.onPageChange).toBeDefined();

        // Toolbar
        expect(logic.toolbar.find((t) => t.id === "export")).toBeDefined();
        expect(logic.toolbar.find((t) => t.id === "import")).toBeDefined();

        // State
        expect(logic.state.exportFormat).toBeDefined();
        expect(logic.state.importing).toBeDefined();
        expect(logic.state.currentPage).toBeDefined();
      });

      it("should support inline-editing + real-time together", () => {
        const blade = createBlade("products-list", "grid", ["inline-editing", "real-time"]);
        const logic = planner.inferLogic(blade);

        // Handlers
        expect(logic.handlers.onCellEdit).toBeDefined();
        expect(logic.handlers.onRowSave).toBeDefined();

        // State
        expect(logic.state.editingCells).toBeDefined();
        expect(logic.state.wsConnected).toBeDefined();
        expect(logic.state.lastUpdate).toBeDefined();
      });
    });
  });
});
