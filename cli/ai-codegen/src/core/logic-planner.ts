import type { Blade } from "./validator.js";
import { camelCase, upperFirst, kebabCase } from "lodash-es";

export interface ToolbarAction {
  id: string;
  icon: string;
  title?: string;
  action: string;
  condition?: string;
}

export interface StateDefinition {
  source: "composable" | "local" | "prop";
  reactive: boolean;
  default?: unknown;
  description?: string;
}

export interface BladeLogic {
  handlers: Record<string, string>;
  toolbar: ToolbarAction[];
  state: Record<string, StateDefinition>;
}

export interface ComposableDefinition {
  name: string;
  methods: string[];
  mockData?: boolean;
}

/**
 * LogicPlanner automatically infers blade logic from structure and features
 *
 * ARCHITECTURE:
 * ```
 * Blade structure + features → LogicPlanner.inferLogic() →
 *   {
 *     handlers: { onItemClick, onSave, onDelete, ... },
 *     toolbar: [refresh, add, delete, save, ...],
 *     state: { items, loading, filters, selectedItems, ... }
 *   }
 * ```
 *
 * INFERENCE RULES:
 * 1. List blade → handlers: onItemClick
 * 2. Details blade → handlers: onSave
 * 3. filters feature → handlers: onApplyFilters, state: stagedFilters
 * 4. multiselect feature → handlers: onSelectionChange, state: selectedItems
 * 5. validation feature → state: errors, validating
 * 6. gallery feature → handlers: onImageClick, state: selectedImage
 *
 * COMPOSABLE INFERENCE:
 * - List blade → useEntityList with methods: load, reload, search, delete
 * - Details blade → useEntityDetails with methods: load, save, validate
 */
export class LogicPlanner {
  /**
   * Infer complete blade logic from blade structure
   */
  inferLogic(blade: Blade): BladeLogic {
    const isListBlade = blade.layout === "grid";
    const features = new Set(blade.features || []);

    const logic: BladeLogic = {
      handlers: {},
      toolbar: [],
      state: {},
    };

    // Infer handlers
    logic.handlers = this.inferHandlers(blade, isListBlade, features);

    // Infer toolbar
    logic.toolbar = this.inferToolbar(blade, isListBlade, features);

    // Infer state
    logic.state = this.inferState(blade, isListBlade, features);

    return logic;
  }

  /**
   * Infer event handlers based on blade type and features
   */
  private inferHandlers(
    blade: Blade,
    isListBlade: boolean,
    features: Set<string>,
  ): Record<string, string> {
    const handlers: Record<string, string> = {};
    const entityName = this.extractEntityName(blade.id);
    const entityPascal = upperFirst(camelCase(entityName));

    if (isListBlade) {
      // List blade handlers with callbacks for parent-child communication
      handlers.onItemClick = `openBlade({blade: markRaw(${entityPascal}Details), param: item.id, onOpen: () => { selectedItemId.value = item.id }, onClose: () => { selectedItemId.value = undefined; load() }})`;

      if (features.has("filters")) {
        handlers.onApplyFilters = `appliedFilters.value = stagedFilters.value; load()`;
      }

      if (features.has("multiselect")) {
        handlers.onSelectionChange = `selectedItems.value = selectedIds`;
        handlers.onDelete = `confirmAndDelete(item.id)`;
      }

      if (features.has("gallery")) {
        handlers.onImageClick = `openImagePreview(image)`;
      }
    } else {
      // Details blade handlers
      handlers.onSave = `validateAndSave()`;

      if (features.has("validation")) {
        handlers.onValidate = `validateForm()`;
      }

      if (features.has("gallery")) {
        handlers.onImageUpload = `uploadImage(file)`;
        handlers.onImageDelete = `deleteImage(imageId)`;
      }
    }

    return handlers;
  }

  /**
   * Infer toolbar actions based on blade type and features
   */
  private inferToolbar(
    blade: Blade,
    isListBlade: boolean,
    features: Set<string>,
  ): ToolbarAction[] {
    const toolbar: ToolbarAction[] = [];
    const entityName = this.extractEntityName(blade.id);
    const entityPascal = upperFirst(camelCase(entityName));

    if (isListBlade) {
      // List blade toolbar
      toolbar.push({
        id: "refresh",
        icon: "fas fa-sync",
        title: `pages.${kebabCase(entityName)}.toolbar.refresh`,
        action: "load()",
      });

      toolbar.push({
        id: "add",
        icon: "fas fa-plus",
        title: `pages.${kebabCase(entityName)}.toolbar.add`,
        action: `openBlade({blade: markRaw(${entityPascal}Details)})`,
      });

      if (features.has("multiselect")) {
        toolbar.push({
          id: "delete-selected",
          icon: "fas fa-trash",
          title: `pages.${kebabCase(entityName)}.toolbar.delete-selected`,
          action: "deleteSelectedItems()",
          condition: "selectedItems.length > 0",
        });
      }
    } else {
      // Details blade toolbar
      toolbar.push({
        id: "save",
        icon: "fas fa-save",
        title: `pages.${kebabCase(entityName)}.toolbar.save`,
        action: "save()",
      });

      toolbar.push({
        id: "save-and-close",
        icon: "fas fa-check",
        title: `pages.${kebabCase(entityName)}.toolbar.save-and-close`,
        action: "saveAndClose()",
      });

      toolbar.push({
        id: "cancel",
        icon: "fas fa-times",
        title: `pages.${kebabCase(entityName)}.toolbar.cancel`,
        action: "close()",
      });
    }

    return toolbar;
  }

  /**
   * Infer state definitions based on blade type and features
   */
  private inferState(
    blade: Blade,
    isListBlade: boolean,
    features: Set<string>,
  ): Record<string, StateDefinition> {
    const state: Record<string, StateDefinition> = {};

    if (isListBlade) {
      // List blade state
      state.items = {
        source: "composable",
        reactive: true,
        description: "List of items from composable",
      };

      state.loading = {
        source: "composable",
        reactive: true,
        description: "Loading state from composable",
      };

      state.totalCount = {
        source: "composable",
        reactive: true,
        description: "Total count from composable",
      };

      if (features.has("filters")) {
        state.stagedFilters = {
          source: "local",
          reactive: true,
          default: {},
          description: "Staged filter values (not yet applied)",
        };

        state.appliedFilters = {
          source: "composable",
          reactive: true,
          description: "Currently applied filters",
        };
      }

      state.selectedItemId = {
        source: "local",
        reactive: true,
        default: undefined,
        description: "Currently opened item ID (for details blade tracking)",
      };

      if (features.has("multiselect")) {
        state.selectedItems = {
          source: "local",
          reactive: true,
          default: [],
          description: "Currently selected item IDs",
        };
      }

      if (features.has("gallery")) {
        state.selectedImage = {
          source: "local",
          reactive: true,
          default: null,
          description: "Currently selected image for preview",
        };
      }
    } else {
      // Details blade state
      state.item = {
        source: "composable",
        reactive: true,
        description: "Current item data from composable",
      };

      state.loading = {
        source: "composable",
        reactive: true,
        description: "Loading state from composable",
      };

      state.modified = {
        source: "local",
        reactive: true,
        default: false,
        description: "Has the form been modified",
      };

      if (features.has("validation")) {
        state.errors = {
          source: "local",
          reactive: true,
          default: {},
          description: "Validation errors by field",
        };

        state.validating = {
          source: "local",
          reactive: true,
          default: false,
          description: "Is validation in progress",
        };
      }

      if (features.has("gallery")) {
        state.images = {
          source: "local",
          reactive: true,
          default: [],
          description: "Uploaded images",
        };

        state.uploading = {
          source: "local",
          reactive: true,
          default: false,
          description: "Is image upload in progress",
        };
      }
    }

    return state;
  }

  /**
   * Infer composable definition from blade
   */
  inferComposable(
    blade: Blade,
    naming?: { entitySingularCamel: string; entitySingularPascal: string },
  ): ComposableDefinition {
    const isListBlade = blade.layout === "grid";
    const features = new Set(blade.features || []);

    const entityName = naming?.entitySingularCamel || this.extractEntityName(blade.id);
    const composableName = isListBlade
      ? `use${upperFirst(camelCase(entityName))}List`
      : `use${upperFirst(camelCase(entityName))}Details`;

    const methods: string[] = [];

    if (isListBlade) {
      // List composable methods
      methods.push("load");
      methods.push("reload");
      methods.push("search");
      methods.push("deleteItem");

      if (features.has("filters")) {
        methods.push("applyFilters");
        methods.push("clearFilters");
      }

      if (features.has("multiselect")) {
        methods.push("deleteSelectedItems");
      }
    } else {
      // Details composable methods
      methods.push("load");
      methods.push("save");
      methods.push("reset");

      if (features.has("validation")) {
        methods.push("validate");
      }

      if (features.has("gallery")) {
        methods.push("uploadImage");
        methods.push("deleteImage");
      }
    }

    return {
      name: composableName,
      methods,
      mockData: true, // Always use mock data initially
    };
  }

  /**
   * Merge inferred logic with user-provided logic
   */
  mergeLogic(inferred: BladeLogic, provided?: Partial<BladeLogic>): BladeLogic {
    if (!provided) {
      return inferred;
    }

    return {
      handlers: {
        ...inferred.handlers,
        ...(provided.handlers || {}),
      },
      toolbar: provided.toolbar || inferred.toolbar,
      state: {
        ...inferred.state,
        ...(provided.state || {}),
      },
    };
  }

  /**
   * Generate human-readable description of logic
   */
  describeLogic(logic: BladeLogic): string {
    const lines: string[] = [];

    lines.push("Blade Logic:");
    lines.push("");

    // Describe handlers
    if (Object.keys(logic.handlers).length > 0) {
      lines.push("Event Handlers:");
      for (const [event, action] of Object.entries(logic.handlers)) {
        lines.push(`  - ${event}: ${action}`);
      }
      lines.push("");
    }

    // Describe toolbar
    if (logic.toolbar.length > 0) {
      lines.push("Toolbar Actions:");
      for (const action of logic.toolbar) {
        const condition = action.condition ? ` (when: ${action.condition})` : "";
        lines.push(`  - ${action.id}: ${action.action}${condition}`);
      }
      lines.push("");
    }

    // Describe state
    if (Object.keys(logic.state).length > 0) {
      lines.push("State Management:");
      for (const [name, def] of Object.entries(logic.state)) {
        const source = def.source === "composable" ? "from composable" : "local";
        const defaultValue = def.default !== undefined ? ` (default: ${JSON.stringify(def.default)})` : "";
        lines.push(`  - ${name}: ${source}${defaultValue}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Extract entity name from blade ID
   */
  private extractEntityName(bladeId: string): string {
    // Remove common suffixes
    const withoutSuffix = bladeId
      .replace(/-list$/, "")
      .replace(/-details$/, "")
      .replace(/-grid$/, "")
      .replace(/-form$/, "");

    return camelCase(withoutSuffix);
  }
}
