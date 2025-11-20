/**
 * AI Generation Guide Builder
 *
 * Builds comprehensive instructions for AI to generate complex blade components.
 * Instead of calling Anthropic API directly, we provide detailed guides for
 * AI assistants (Cursor/Claude Code) to generate code in context.
 *
 * @since 0.7.0
 */

import type { GenerationRules } from "./generation-rules";
import type { FrameworkAPISearchEngine } from "./framework-search-engine";
import type { BladeGenerationContext } from "../types/blade-context";

export interface AIGenerationStep {
  step: number;
  title: string;
  description: string;
  explanation: string;
  requirements?: string[];
  patternReferences?: string[];
  code?: string; // Legacy field - kept for backward compatibility but deprecated
  componentsDocs?: string;
  warnings?: string[];
}

export interface AIGenerationGuide {
  task: string;
  context: {
    blade: {
      id: string;
      layout: string;
      title: string;
      route: string;
    };
    entity: string;
    module: string;
    features: string[];
    columns?: Array<{ id: string; title: string; type: string; sortable?: boolean; width?: number }>;
    fields?: Array<{ key: string; as: string; label: string; required?: boolean; validation?: string }>;
    logic?: any;
    complexity: number;
  };
  instructions: {
    summary: string;
    steps: AIGenerationStep[];
    examples: {
      similar: string[];
      templateReference: string;
    };
    constraints: string[];
    patterns: Array<{
      name: string;
      description: string;
      code: string;
    }>;
  };
  verification: {
    checklist: string[];
    mustHave: string[];
    mustNotHave: string[];
  };
}

// BladeGenerationContext is now imported from ../types/blade-context

export class AIGenerationGuideBuilder {
  constructor(
    private rules?: GenerationRules,
    private frameworkSearch?: FrameworkAPISearchEngine,
  ) {}

  /**
   * Build comprehensive AI generation guide for a blade
   */
  buildGuide(context: BladeGenerationContext): AIGenerationGuide {
    const isListBlade = context.type === "list";

    return {
      task: isListBlade
        ? `Generate a list blade with VcTable for ${context.entity}`
        : `Generate a details blade with VcForm for ${context.entity}`,

      context: {
        blade: {
          id: context.blade.id,
          layout: context.blade.layout,
          title: context.blade.title || `${context.entity} ${context.type}`,
          route: context.blade.route || `/${context.module}`,
        },
        entity: context.entity,
        module: context.module,
        features: context.features,
        columns: context.columns?.map((col) => ({
          id: col.id,
          title: col.title,
          type: col.type || "string",
          sortable: col.sortable,
          width: col.width ? Number(col.width) : undefined,
        })),
        fields: context.fields,
        logic: context.logic,
        complexity: context.complexity,
      },

      instructions: {
        summary: this.buildSummary(context),
        steps: isListBlade ? this.buildListSteps(context) : this.buildDetailsSteps(context),
        examples: this.buildExamples(context),
        constraints: this.buildConstraints(context),
        patterns: this.loadRelevantPatterns(context),
      },

      verification: {
        checklist: this.buildChecklist(context),
        mustHave: this.buildMustHave(context),
        mustNotHave: this.buildMustNotHave(context),
      },
    };
  }

  /**
   * Build summary description of what needs to be generated
   */
  private buildSummary(context: BladeGenerationContext): string {
    const { entity, module, features, columns, fields, complexity } = context;

    if (context.type === "list") {
      return `
🔥 GENERATE COMPLETE VUE SFC CODE - DO THIS IMMEDIATELY

**Module:** ${module}
**Entity:** ${entity} (singular)
**Features:** ${features.join(", ") || "none"}
**Columns:** ${columns?.length || 0} columns
**Complexity:** ${complexity}/20

⚠️ YOU MUST GENERATE COMPLETE CODE NOW - NO USER CONFIRMATION NEEDED

REQUIRED IMPLEMENTATION:
- VcBlade container with toolbar
- VcTable with ${columns?.length || 0} columns (see context.columns for exact specs)
${features.includes("filters") ? "- Filter panel with search and custom filters" : ""}
${features.includes("multiselect") ? "- Row selection with checkboxes for bulk operations" : ""}
- Click handler to open details blade
- Loading states and error handling
- i18n support for all text
- TypeScript types

WORKFLOW:
1. Read the base generated .vue file
2. Follow EVERY step in the 'steps' array below
3. Generate complete Vue SFC code with ALL requirements
4. Call submit_generated_code tool immediately

❌ DO NOT:
- Ask user for confirmation
- Summarize what you will do
- Stop after reading files

✅ COMPLEXITY: ${complexity}/20 - Follow ALL step-by-step instructions below
`.trim();
    } else {
      return `
🔥 GENERATE COMPLETE VUE SFC CODE - DO THIS IMMEDIATELY

**Module:** ${module}
**Entity:** ${entity} (singular)
**Features:** ${features.join(", ") || "none"}
**Fields:** ${fields?.length || 0} fields
**Complexity:** ${complexity}/20

⚠️ YOU MUST GENERATE COMPLETE CODE NOW - NO USER CONFIRMATION NEEDED

REQUIRED IMPLEMENTATION:
- VcBlade container with toolbar
- VcForm with ${fields?.length || 0} fields (see context.fields for exact specs)
${features.includes("validation") ? "- vee-validate integration for form validation" : ""}
${features.includes("gallery") ? "- Image gallery section with upload/edit/remove" : ""}
${features.includes("widgets") ? "- Widget integration in sidebar" : ""}
- Save/Delete buttons in toolbar
- Modification tracking with unsaved changes warning
- Loading states and error handling
- i18n support for all text
- TypeScript types

WORKFLOW:
1. Read the base generated .vue file
2. Follow EVERY step in the 'steps' array below
3. Generate complete Vue SFC code with ALL requirements
4. Call submit_generated_code tool immediately

❌ DO NOT:
- Ask user for confirmation
- Summarize what you will do
- Stop after reading files

✅ COMPLEXITY: ${complexity}/20 - Follow ALL step-by-step instructions below
`.trim();
    }
  }

  /**
   * Build step-by-step instructions for list blade
   */
  private buildListSteps(context: BladeGenerationContext): AIGenerationStep[] {
    const { entity, module, features, columns } = context;
    const entityCapitalized = this.capitalize(entity || "item");
    const entityUpper = entity ? entity.toUpperCase() : "ITEM";
    const moduleUpper = module ? module.toUpperCase() : "MODULE";

    const steps: AIGenerationStep[] = [];

    // Step 1: Template structure
    steps.push({
      step: 1,
      title: "Create <template> section with VcBlade and VcTable",
      description: "Build the main template structure with VcBlade container and VcTable for data display",
      explanation: `
VcBlade is the container component that provides:
- Title with i18n
- Toolbar for actions (refresh, add, delete)
- Loading overlay
- Close/expand/collapse controls

VcTable displays the data with:
- Dynamic columns configuration
- Pagination support
- ${features.includes("multiselect") ? "Multi-select for bulk operations" : "Single item selection"}
- ${features.includes("filters") ? "Search and filter capabilities" : "Basic sorting"}
- Custom cell rendering via slots
`,
      requirements: [
        "Use VcBlade as root component",
        "Set v-loading to loading state from composable",
        "Use $t() for title: ${moduleUpper}.PAGES.LIST.TITLE",
        "Bind toolbar-items to bladeToolbar array",
        "Add VcTable inside VcBlade",
        "Configure VcTable columns from columns array",
        features.includes("multiselect") ? "Enable multiselect with :multiselect='true'" : "",
        features.includes("filters") ? "Add <template #filters> slot with search input" : "",
        "Add <template #item_{columnId}> slots for custom column rendering"
      ].filter(Boolean),
      patternReferences: [
        "examples/patterns/blade-list-complete.md",
        "examples/components/VcBlade-demo.md",
        "examples/components/VcTable-demo.md",
        features.includes("filters") ? "examples/compositions/list/filters-pattern.md" : "",
      ].filter(Boolean),
      componentsDocs: this.getComponentsDocs(["VcBlade", "VcTable"]),
    });

    // Step 2: Script setup
    steps.push({
      step: 2,
      title: "Create <script setup> section with imports and composable",
      description: "Set up TypeScript, imports, composable usage, and reactive state",
      code: `
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBladeNavigation } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";
import use${entityCapitalized}List from "../composables/use${entityCapitalized}List";
import ${entityCapitalized}Details from "./${entity}-details.vue";

const { t } = useI18n({ useScope: "global" });

// Navigation
const { openBlade } = useBladeNavigation();

// Props
interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

// Composable for list data and operations
const {
  items,
  loading,
  totalCount,
  currentPage,
  pageSize,
  load${entityCapitalized}s,
  delete${entityCapitalized}s,
} = use${entityCapitalized}List();

// Local UI state
${features.includes("filters") ? `const searchKeyword = ref("");` : ""}
${features.includes("filters") ? `const activeFilterCount = ref(0);` : ""}
${features.includes("multiselect") ? `const selectedItemId = ref<string>();` : ""}
${features.includes("multiselect") ? `const selectedIds = ref<string[]>([]);` : ""}
const sortExpression = ref("");

// Computed
const pages = computed(() => Math.ceil(totalCount.value / pageSize.value));

// Initialize
onMounted(async () => {
  await load${entityCapitalized}s({
    page: currentPage.value,
    itemsPerPage: pageSize.value,
  });
});

// Expose methods for parent blade
defineExpose({
  title: computed(() => t("${moduleUpper}.PAGES.LIST.TITLE")),
  reload: () => load${entityCapitalized}s({
    page: currentPage.value,
    itemsPerPage: pageSize.value,
    sort: sortExpression.value,
  }),
});
</script>`,
      explanation: `
Key concepts:
1. **useBladeNavigation**: Framework composable for opening/closing blades
2. **Composable pattern**: Business logic (data, pagination) is in use${entityCapitalized}List composable
3. **TypeScript**: Strong typing with Props interface
4. **Reactive state**: ref() for UI state, composable provides data state
5. **i18n**: All strings use $t() for internationalization
6. **Lifecycle**: onMounted() loads initial data
7. **defineExpose**: Exposes title and reload() for parent blade to access
`,
    });

    // Step 3: Event handlers
    steps.push({
      step: 3,
      title: "Implement event handlers",
      description: "Add handlers for user interactions: clicks, pagination, search, filters",
      code: `
// Event Handlers
async function onItemClick(item: { id: string }) {
  // Open details blade using useBladeNavigation
  const { openBlade } = useBladeNavigation();

  await openBlade({
    blade: ${entityCapitalized}Details,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

function onHeaderClick(column: { id: string }) {
  // Toggle sort direction
  if (sortExpression.value === column.id) {
    sortExpression.value = \`\${column.id}:desc\`;
  } else if (sortExpression.value === \`\${column.id}:desc\`) {
    sortExpression.value = "";
  } else {
    sortExpression.value = column.id;
  }

  // Reload with new sort
  load${entityCapitalized}s({
    page: 1,
    itemsPerPage: pageSize.value,
    sort: sortExpression.value,
  });
}

async function onPaginationClick(page: number) {
  currentPage.value = page;
  await load${entityCapitalized}s({
    page: currentPage.value,
    itemsPerPage: pageSize.value,
    sort: sortExpression.value,
  });
}

${
  features.includes("filters")
    ? `
async function onSearchChange(keyword: string) {
  searchKeyword.value = keyword;
  currentPage.value = 1;
  await load${entityCapitalized}s({
    page: 1,
    itemsPerPage: pageSize.value,
    keyword: searchKeyword.value,
    sort: sortExpression.value,
  });
}`
    : ""
}`,
      explanation: `
Event handlers connect UI interactions to business logic:
- **onItemClick**: Opens details blade via openBlade() helper
- **onHeaderClick**: Toggles column sorting (asc → desc → none)
- **onPaginationClick**: Loads next/previous page
${features.includes("filters") ? "- **onSearchChange**: Filters items by keyword" : ""}
`,
    });

    // Step 4: Toolbar configuration
    steps.push({
      step: 4,
      title: "Configure toolbar actions",
      description: "Define toolbar buttons with handlers and dynamic disable states",
      code: `
// Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("${moduleUpper}.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await load${entityCapitalized}s({
        page: currentPage.value,
        itemsPerPage: pageSize.value,
        sort: sortExpression.value,
      });
    },
  },
  {
    id: "add",
    title: computed(() => t("${moduleUpper}.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    async clickHandler() {
      await openBlade({
        blade: ${entityCapitalized}Details,
      });
    },
  },
  ${
    features.includes("multiselect")
      ? `{
    id: "delete",
    title: computed(() => t("${moduleUpper}.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "material-delete",
    disabled: computed(() => selectedIds.value.length === 0),
    async clickHandler() {
      if (!confirm(t("COMMON.CONFIRM_DELETE"))) return;

      await delete${entityCapitalized}s(selectedIds.value);
      selectedIds.value = [];

      // Reload list
      await load${entityCapitalized}s({
        page: currentPage.value,
        itemsPerPage: pageSize.value,
      });
    },
  },`
      : ""
  }
]);`,
      explanation: `
Toolbar actions:
- **refresh**: Reloads current page
- **add**: Opens empty details blade for creating new item
${features.includes("multiselect") ? "- **delete**: Bulk deletes selected items (disabled when none selected)" : ""}

Note: computed() for titles enables i18n reactivity
`,
    });

    // Step 5: Columns configuration
    steps.push({
      step: 5,
      title: "Define columns configuration",
      description: "Configure table columns with sorting, width, and custom rendering",
      code: this.generateColumnsConfigCode(context),
      explanation: `
Each column defines:
- **id**: Unique column identifier (matches data property)
- **title**: i18n key for column header
- **sortable**: Enable/disable sorting
- **width**: Optional fixed width (for images, actions)

Custom rendering is done via <template #item_{id}> slots in template section.
`,
    });

    // Step 6: TypeScript types
    steps.push({
      step: 6,
      title: "Add TypeScript interfaces",
      description: "Define interfaces for type safety",
      code: `
// Types
interface ${entityCapitalized} {
  id: string;
${columns?.map((col) => `  ${col.id}: ${this.inferTypeFromColumnType(col.type || "string")};`).join("\n") || "  name: string;"}
}

interface SearchArgs {
  page: number;
  itemsPerPage: number;
  keyword?: string;
  sort?: string;
}`,
      explanation: `
TypeScript interfaces provide:
- **${entityCapitalized}**: Data model for each item
- **SearchArgs**: Parameters for load function

This ensures type safety and autocomplete throughout the component.
`,
    });

    return steps;
  }

  /**
   * Build step-by-step instructions for details blade
   */
  private buildDetailsSteps(context: BladeGenerationContext): AIGenerationStep[] {
    const { entity, module, features, fields } = context;
    const entityCapitalized = this.capitalize(entity || "item");
    const entityUpper = entity ? entity.toUpperCase() : "ITEM";
    const moduleUpper = module ? module.toUpperCase() : "MODULE";

    const steps: AIGenerationStep[] = [];

    // Step 1: Template with VcForm
    steps.push({
      step: 1,
      title: "Create <template> section with VcBlade and VcForm",
      description: "Build form layout with VcBlade container and VcForm with fields",
      code: `
<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    :closable="closable"
    :expanded="expanded"
    width="70%"
    @close="onClose"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="true">
      <div class="tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm class="tw-space-y-4">
            ${this.generateFieldsCode(context)}
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>`,
      explanation: `
VcBlade provides:
- **:modified="modified"**: Shows unsaved changes indicator
- **@close="onClose"**: Custom close handler with confirmation

VcForm contains Field components from vee-validate for validation.
Each field is wrapped in Field component for error handling.
`,
      componentsDocs: this.getComponentsDocs(["VcBlade", "VcForm", "VcContainer"]),
    });

    // Step 2: Script setup with vee-validate
    steps.push({
      step: 2,
      title: "Set up script with vee-validate and composable",
      description: "Configure form validation, state management, and lifecycle",
      code: `
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useForm, Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { useBeforeUnload, useBladeNavigation, notification } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";
import use${entityCapitalized}Details from "../composables/use${entityCapitalized}Details";

const { t } = useI18n({ useScope: "global" });

// Navigation
const { closeBlade } = useBladeNavigation();

// Prevent page unload with unsaved changes
useBeforeUnload();

// Props
interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string; // ID for edit, undefined for create
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

// Composable for details data and operations
const {
  item: ${entity},
  loading,
  modified,
  load${entityCapitalized},
  create${entityCapitalized},
  update${entityCapitalized},
  delete${entityCapitalized},
} = use${entityCapitalized}Details();

// vee-validate
const { meta, setFieldError } = useForm();

// Computed
const title = computed(() =>
  ${entity}.value.id
    ? t("${moduleUpper}.PAGES.DETAILS.TITLE_EDIT", { name: ${entity}.value.name })
    : t("${moduleUpper}.PAGES.DETAILS.TITLE_NEW")
);

// Load data on mount
onMounted(async () => {
  if (props.param) {
    await load${entityCapitalized}({ id: props.param });
  }
});

// Expose methods for parent blade
defineExpose({
  title,
  reload: () => {
    if (props.param) {
      return load${entityCapitalized}({ id: props.param });
    }
  },
  save: onSave,
});
</script>`,
      explanation: `
Key features:
- **useBeforeUnload**: Framework composable that warns user on browser refresh with unsaved changes
- **useBladeNavigation**: Provides closeBlade() for programmatic blade closing
- **vee-validate**: Form validation with meta and setFieldError
- **Composable pattern**: Details data and operations in use${entityCapitalized}Details composable
- **Conditional loading**: Only loads data if param (ID) is provided
- **defineExpose**: Exposes title, reload(), and save() for parent blade
`,
    });

    // Step 3: CRUD handlers
    steps.push({
      step: 3,
      title: "Implement CRUD handlers",
      description: "Add save, delete, and close handlers with validation",
      code: `
// Handlers
async function onSave() {
  if (!meta.value.valid) {
    notification.warning(t("COMMON.VALIDATION_ERRORS"));
    return;
  }

  try {
    if (${entity}.value.id) {
      // Update existing
      await update${entityCapitalized}(${entity}.value);
      notification.success(t("COMMON.SAVE_SUCCESS"));
    } else {
      // Create new
      const created = await create${entityCapitalized}(${entity}.value);
      notification.success(t("COMMON.CREATE_SUCCESS"));

      // Update route to show ID (optional)
      // router.replace({ params: { id: created.id } });
    }
  } catch (error) {
    console.error("Error saving ${entity}:", error);
    notification.error(t("COMMON.SAVE_ERROR"));
  }
}

async function onDelete() {
  if (!${entity}.value.id) return;

  // Use framework's usePopup for confirmations
  const { showConfirmation } = await import("@vc-shell/framework");
  const confirmed = await showConfirmation(t("COMMON.CONFIRM_DELETE"));

  if (!confirmed) return;

  try {
    await delete${entityCapitalized}({ id: ${entity}.value.id });
    notification.success(t("COMMON.DELETE_SUCCESS"));

    // Close blade using closeBlade() or emit
    closeBlade();
  } catch (error) {
    console.error("Error deleting ${entity}:", error);
    notification.error(t("COMMON.DELETE_ERROR"));
  }
}

function onClose() {
  if (modified.value) {
    // Simple browser confirm for unsaved changes
    if (!confirm(t("COMMON.UNSAVED_CHANGES"))) return;
  }

  // Close via emit, not closeCurrentBlade()
  emit("close:blade");
}`,
      explanation: `
CRUD operations with correct framework APIs:
- **onSave**: Validates, creates/updates, shows notifications
- **onDelete**: Uses showConfirmation() from framework, shows notifications
- **onClose**: Emits "close:blade" event instead of calling closeCurrentBlade()
- **notification**: Framework utility for success/error/warning messages
- **closeBlade()**: From useBladeNavigation for programmatic close

Error handling with user feedback included for all operations.
`,
    });

    // Step 4: Toolbar configuration
    steps.push({
      step: 4,
      title: "Configure toolbar with conditional buttons",
      description: "Define save/delete buttons with dynamic disable states",
      code: `
// Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("${moduleUpper}.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    disabled: computed(() => !(meta.value.valid && modified.value)),
    async clickHandler() {
      await onSave();
    },
  },
  {
    id: "delete",
    title: computed(() => t("${moduleUpper}.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "material-delete",
    disabled: computed(() => !${entity}.value.id),
    async clickHandler() {
      await onDelete();
    },
  },
]);`,
      explanation: `
Toolbar logic:
- **save**: Disabled if form invalid or no changes
- **delete**: Disabled for new items (no ID yet)

computed() enables reactive disable states based on form state.
`,
    });

    // Step 5: TypeScript types
    steps.push({
      step: 5,
      title: "Add TypeScript interfaces",
      description: "Define data model interface",
      code: `
// Types
interface ${entityCapitalized} {
  id?: string;
${fields?.map((field) => `  ${field.key}${field.required ? "" : "?"}: ${this.inferTypeFromFieldAs(field.as)};`).join("\n") || "  name: string;"}
}`,
      explanation: `
Interface defines the data model:
- **id**: Optional (undefined for new items)
- **Field types**: Inferred from input component types
${fields?.some((f) => !f.required) ? "- **Optional fields**: Marked with ?" : ""}
`,
    });

    // Step 6: Widget registration (if widgets feature is enabled)
    if (features.includes("widgets")) {
      steps.push({
        step: 6,
        title: "Register widgets (optional)",
        description: "Add widget registration for contextual panels using vendor-portal pattern",
        code: this.buildWidgetRegistrationPattern(context),
        explanation: `
Widget registration pattern from vendor-portal:
- **registerWidget()**: Framework API for widget registration
- **NO markRaw()**: Component is passed directly
- **Immediate registration**: Call registerWidgets() right after setup
- **Cleanup**: Always unregister in onBeforeUnmount
- **Reactive props**: Use computed() for dynamic widget props
- **Conditional visibility**: isVisible controls when widget appears

This pattern matches real production code from apps/vendor-portal/src/modules/offers/pages/offers-details.vue:668-682
`,
        componentsDocs: this.getComponentsDocs(["useWidgets", "useBlade"]),
      });
    }

    return steps;
  }

  // Helper methods

  /**
   * Build widget registration pattern based on vendor-portal real code
   * Reference: apps/vendor-portal/src/modules/offers/pages/offers-details.vue:668-682
   */
  private buildWidgetRegistrationPattern(context: BladeGenerationContext): string {
    const { entity, module } = context;
    const entityCapitalized = this.capitalize(entity);

    return `
// Import widget component and framework hooks
import { useWidgets, useBlade } from "@vc-shell/framework";
import { onBeforeUnmount, computed } from "vue";
import { SpecialWidget } from "../widgets/special-widget.vue";

// Get widget API
const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

// Widget registration function
function registerWidgets() {
  registerWidget(
    {
      id: "special-widget",
      component: SpecialWidget,  // NO markRaw() - direct component reference!
      props: {
        // Pass reactive props using computed()
        ${entity}Id: computed(() => ${entity}.value?.id),
        data: computed(() => ${entity}.value),
      },
      isVisible: computed(() => !!props.param),  // Only show for existing items
      updateFunctionName: "updateCount",  // Optional: callback method name
    },
    blade?.value.id,  // Parent blade ID for proper nesting
  );
}

// Register widgets immediately after setup
registerWidgets();

// IMPORTANT: Always cleanup on unmount
onBeforeUnmount(() => {
  unregisterWidget("special-widget", blade?.value.id);
});
`;
  }

  private capitalize(str: string): string {
    if (!str || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateFiltersSlotCode(context: BladeGenerationContext): string {
    const moduleUpper = context.module ? context.module.toUpperCase() : "MODULE";
    return `
      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-16">
            <!-- Search input -->
            <VcInput
              v-model="searchKeyword"
              :placeholder="$t('${moduleUpper}.PAGES.LIST.FILTER.SEARCH_PLACEHOLDER')"
              clearable
            />

            <!-- Custom filters can be added here -->
          </VcRow>
        </div>
      </template>`;
  }

  private generateColumnSlotsCode(context: BladeGenerationContext): string {
    const columns = context.columns || [];

    return columns
      .map((col) => {
        switch (col.type) {
          case "link":
            return `
      <template #item_${col.id}="{ item }">
        <div class="tw-truncate tw-cursor-pointer" @click="onItemClick(item)">
          {{ item.${col.id} }}
        </div>
      </template>`;

          case "status":
            return `
      <template #item_${col.id}="{ item }">
        <VcStatus
          :variant="item.${col.id} ? 'success' : 'danger'"
          :outline="false"
        >
          {{ item.${col.id} ? $t('COMMON.ENABLED') : $t('COMMON.DISABLED') }}
        </VcStatus>
      </template>`;

          case "date-ago":
            return `
      <template #item_${col.id}="{ item }">
        {{ moment(item.${col.id}).fromNow() }}
      </template>`;

          case "image":
            return `
      <template #item_${col.id}="{ item }">
        <VcImage :src="item.${col.id}" size="s" />
      </template>`;

          default:
            return `      <!-- Column ${col.id} uses default rendering -->`;
        }
      })
      .join("\n");
  }

  private generateColumnsConfigCode(context: BladeGenerationContext): string {
    const columns = context.columns || [];
    const moduleUpper = context.module ? context.module.toUpperCase() : "MODULE";

    return `
const columns = [
${columns
  .map(
    (col) => `  {
    id: "${col.id}",
    title: computed(() => t("${moduleUpper}.PAGES.LIST.COLUMNS.${col.id.toUpperCase()}")),
    ${col.sortable ? "sortable: true," : ""}
    ${col.width ? `width: ${col.width},` : ""}
  }`,
  )
  .join(",\n")}
];`;
  }

  private generateFieldsCode(context: BladeGenerationContext): string {
    const fields = context.fields || [];
    const moduleUpper = context.module ? context.module.toUpperCase() : "MODULE";

    return fields
      .map(
        (field) => `
            <Field
              v-slot="{ field: fieldProps, errorMessage, errors }"
              :label="$t('${moduleUpper}.PAGES.DETAILS.FIELDS.${field.key.toUpperCase()}.LABEL')"
              :model-value="${context.entity}.${field.key}"
              name="${field.key}"
              ${field.validation ? `rules="${field.validation}"` : ""}
            >
              <${field.as}
                v-bind="fieldProps"
                v-model="${context.entity}.${field.key}"
                ${field.required ? "required" : ""}
                :placeholder="$t('${moduleUpper}.PAGES.DETAILS.FIELDS.${field.key.toUpperCase()}.PLACEHOLDER')"
                :error="!!errors.length"
                :error-message="errorMessage"
              />
            </Field>`,
      )
      .join("\n");
  }

  private inferTypeFromColumnType(type: string): string {
    switch (type) {
      case "link":
      case "status":
      case "image":
        return "string";
      case "date-ago":
        return "string | Date";
      default:
        return "string";
    }
  }

  private inferTypeFromFieldAs(as: string): string {
    switch (as) {
      case "VcInput":
      case "VcTextarea":
      case "VcSelect":
        return "string";
      case "VcSwitch":
      case "VcCheckbox":
        return "boolean";
      case "VcInputCurrency":
        return "number";
      default:
        return "string";
    }
  }

  private buildExamples(context: BladeGenerationContext): { similar: string[]; templateReference: string } {
    // Find similar examples from existing templates
    const similar = [
      `See examples/templates/${context.type}-simple.vue for basic structure`,
      `See examples/components/VcTable-demo.md for VcTable usage`,
      `See examples/patterns/${context.type}-patterns.md for common patterns`,
    ];

    const templateName =
      context.type === "list"
        ? context.features.includes("filters")
          ? "list-filters"
          : "list-simple"
        : context.features.includes("validation")
          ? "details-validation"
          : "details-simple";

    return {
      similar,
      templateReference: `Check examples/templates/${templateName}.vue for reference`,
    };
  }

  private buildConstraints(context: BladeGenerationContext): string[] {
    const constraints = [
      "Use ONLY components from VC-Shell framework (@vc-shell/framework)",
      "All user-visible text MUST use vue-i18n: $t('MODULE.KEY')",
      "Use TypeScript with proper interfaces (no 'any' types)",
      "Follow VcBlade pattern: one blade = one .vue file",
      "Business logic goes in composables, NOT in blade components",
      `Entity name is '${context.entity}' (singular)`,
      `Module name is '${context.module}' (plural, kebab-case)`,
      "Use Tailwind CSS classes with tw- prefix",
      "Import only existing components, don't create new ones",
      "Handle all errors with try-catch and notifications",
      "Show loading states during async operations",
      "",
      "FRAMEWORK COMPOSABLES - MUST USE CORRECT APIS:",
      "- Navigation: useBladeNavigation() - provides openBlade(), closeBlade()",
      "- Confirmations: usePopup() - provides showConfirmation(), showError()",
      "- Prevent browser unload: useBeforeUnload(modifiedRef) - NEVER window.onbeforeunload!",
      "- Prevent blade close: onBeforeClose(async () => { ... }) - NEVER manual confirm() in onClose!",
      "- Notifications: import { notification } from '@vc-shell/framework'",
      "- Close blade: emit('close:blade') OR closeBlade() - NEVER closeCurrentBlade()",
      "- Pagination state: In composable, NOT in component",
      "- MUST use defineExpose() to expose title and reload() method",
      "",
      "⚠️ CRITICAL TYPE-SAFETY CONSTRAINTS - BREAKING THESE CAUSES TYPESCRIPT ERRORS:",
      "❌ NEVER use useNotifications() for toast messages - it's for WebSocket push notifications ONLY",
      "✅ ALWAYS use: import { notification } from '@vc-shell/framework'; notification.success/error/warning/info(message)",
      "❌ NEVER use useConfirmation() - this export does NOT exist in framework",
      "✅ ALWAYS use: const { showConfirmation } = usePopup()",
      "❌ VcButton variant ONLY accepts: 'primary' | 'secondary' - NO 'outline', 'danger', 'warning'",
      "❌ VcButton size ONLY accepts: 'xs' | 'sm' | 'base' - NO 's', 'm', 'l', 'small', 'medium', 'large'",
      "❌ VcButton icon prop ONLY accepts: boolean - NO 'true' string value",
      "❌ VcGallery @remove event passes FULL image object: (image: ICommonAsset) - NOT just imageId string",
      "✅ Handler signature: function onImageRemove(image: ICommonAsset) { ... } - use image.id inside",
      "❌ VcSelect @update:model-value passes unknown type - NOT typed value",
      "✅ Handler signature: (value: unknown) => void - cast to your type: const id = value as string",
      "❌ NEVER use onParentCall in openBlade() config - it does NOT exist in IBladeEvent",
      "✅ Parent-child communication: child uses emit('parent:call', args), parent listens to blade events",
      "❌ CustomEvent types in window.addEventListener require Event type, NOT CustomEvent",
      "✅ Handler signature: (event: Event) => void, then cast: const e = event as CustomEvent; e.detail",
      "❌ Dynamic field access can be undefined - add null coalescing",
      "✅ const value = obj[field as keyof T] ?? ''; // Prevent undefined errors",
      "",
      "⚠️ BROWSER UNLOAD PREVENTION (CRITICAL):",
      "❌ NEVER use window.onbeforeunload manually - causes memory leaks and issues",
      "❌ WRONG pattern: watch(modified, (val) => { window.onbeforeunload = val ? () => message : null })",
      "✅ ALWAYS use: useBeforeUnload(modifiedRef) - framework handles cleanup",
      "✅ CORRECT: import { useBeforeUnload } from '@vc-shell/framework'; useBeforeUnload(modified);",
      "",
      "⚠️ BLADE CLOSE CONFIRMATION (CRITICAL):",
      "❌ NEVER use manual confirm() in onClose handler - not async and poor UX",
      "❌ WRONG pattern: function onClose() { if (modified.value && !confirm('Sure?')) return; emit('close:blade'); }",
      "✅ ALWAYS use: onBeforeClose hook with showConfirmation",
      "✅ CORRECT pattern:",
      "  import { onBeforeClose } from '@vc-shell/framework';",
      "  const { showConfirmation } = usePopup();",
      "  onBeforeClose(async () => {",
      "    if (modified.value) {",
      "      return await showConfirmation(t('COMMON.UNSAVED_CHANGES'));",
      "    }",
      "  });",
      "",
      "⚠️ MODULE REGISTRATION (AI_FULL STRATEGY ONLY):",
      "❌ NEVER create or modify bootstrap.ts - module registration is automated",
      "❌ NEVER use registerModule() or addMenuItem() manually in bootstrap.ts",
      "✅ System automatically registers module in main.ts using .use(ModuleName, { router })",
      "✅ Focus ONLY on creating blade components and module index.ts file",
      "",
      "⚠️ MENU ITEMS (CRITICAL):",
      "❌ NEVER add menu items in bootstrap.ts using addMenuItem()",
      "✅ ALWAYS define menuItem in workspace blade's defineOptions",
      "✅ Pattern: defineOptions({ isWorkspace: true, menuItem: { title, icon, priority } })",
      "✅ Each module should have ONE workspace blade with menuItem defined",
      "✅ bootstrap.ts is ONLY for dashboard widgets, NOT for menu items",
    ];

    // Add feature-specific constraints
    if (context.features.includes("validation")) {
      constraints.push("Use vee-validate Field component for all form inputs");
      constraints.push("Validation rules go in rules= prop (e.g., rules='required|email')");
    }

    if (context.features.includes("filters")) {
      constraints.push("Filters go in <template #filters> slot, not as separate props");
    }

    if (context.features.includes("multiselect")) {
      constraints.push("Multiselect is enabled via :multiselect='true' prop on VcTable");
    }

    return constraints;
  }

  private buildChecklist(context: BladeGenerationContext): string[] {
    const checklist = [
      "✓ Template uses VcBlade as root container",
      context.type === "list" ? "✓ VcTable with columns configuration" : "✓ VcForm with Field components",
      "✓ <script setup lang='ts'> with TypeScript",
      "✓ Composable is imported and destructured",
      "✓ All text uses $t() for i18n (no hardcoded strings)",
      "✓ Event handlers are defined (onClick/onSave/onDelete)",
      "✓ Toolbar items array is configured",
      "✓ Loading states handled (v-loading on VcBlade)",
      "✓ Error handling with try-catch blocks",
      "✓ TypeScript interfaces defined",
    ];

    // Add feature-specific checks
    if (context.features.includes("validation")) {
      checklist.push("✓ vee-validate Field wraps all inputs");
      checklist.push("✓ Form validation checked before save");
    }

    if (context.features.includes("filters")) {
      checklist.push("✓ Filters slot implemented");
      checklist.push("✓ Search handler updates keyword and reloads");
    }

    if (context.features.includes("multiselect")) {
      checklist.push("✓ selectedIds ref defined and managed");
      checklist.push("✓ Delete button disabled when no selection");
    }

    return checklist;
  }

  private buildMustHave(context: BladeGenerationContext): string[] {
    return [
      "<template> section with VcBlade",
      "<script setup lang='ts'> section",
      "Composable import and usage",
      "TypeScript interfaces",
      "Event handlers (at least onItemClick or onSave)",
      "Toolbar configuration array",
      "i18n $t() for all text",
      "Loading state handling",
      "Error handling with try-catch",
    ];
  }

  private buildMustNotHave(context: BladeGenerationContext): string[] {
    return [
      "Hardcoded strings (use $t() instead)",
      "Unknown/custom components (only VC-Shell components)",
      "Inline CSS styles (use Tailwind tw- classes)",
      "console.log() statements in production code",
      "Mock data in blade (belongs in composable)",
      "Direct API calls (use composable methods)",
      "'any' TypeScript types (use proper types)",
      "Duplicate code (extract to functions)",
      "",
      "FORBIDDEN PATTERNS:",
      "❌ closeCurrentBlade() - This function does NOT exist!",
      "❌ window.addEventListener('beforeunload') - Use useBeforeUnload() instead",
      "❌ Pagination state in component - Must be in composable",
      "❌ markRaw() for widgets - Pass component directly",
      "❌ Missing defineExpose() - Required for parent blade access",
      "",
      "FORBIDDEN: MODULE REGISTRATION (AI_FULL ONLY):",
      "❌ Creating bootstrap.ts file - Registration is automated",
      "❌ Calling registerModule() function - System handles this",
      "❌ Using addMenuItem() in bootstrap.ts - Menu items go in blade defineOptions",
      "❌ Modifying main.ts manually - System uses ModuleRegistrar class",
      "",
      "FORBIDDEN: MENU ITEMS:",
      "❌ addMenuItem() in bootstrap.ts - WRONG! Use defineOptions menuItem in workspace blade",
      "❌ Missing isWorkspace: true in main blade - Required for menu integration",
      "❌ Missing menuItem in defineOptions - Workspace blade needs menu configuration",
      "",
      "FORBIDDEN: BROWSER UNLOAD:",
      "❌ window.onbeforeunload = ... - WRONG! Use useBeforeUnload(modifiedRef)",
      "❌ watch(modified) setting window.onbeforeunload - Use useBeforeUnload instead",
      "",
      "FORBIDDEN: BLADE CLOSE:",
      "❌ Manual confirm() in onClose handler - WRONG! Use onBeforeClose hook",
      "❌ function onClose() { if (!confirm()) return; emit('close:blade') } - Use onBeforeClose",
      "❌ Emitting close:blade after confirmation - onBeforeClose handles it automatically",
    ];
  }

  private loadRelevantPatterns(
    context: BladeGenerationContext,
  ): Array<{ name: string; description: string; code: string }> {
    // Load relevant patterns based on context
    const patterns = [];

    // ALWAYS ADD CRITICAL PATTERN RULES FIRST
    patterns.push({
      name: "CRITICAL_PATTERN_RULES",
      description: "MANDATORY patterns that MUST be followed in all generated code",
      code: this.getCriticalPatternRules(context),
    });

    // Add blade-specific pattern examples
    if (context.type === "list") {
      patterns.push({
        name: "blade-list-complete",
        description: "Complete list blade pattern with VcTable (READ THIS CAREFULLY)",
        code: "Reference: examples/patterns/blade-list-complete.md - Shows correct props/emits structure, VcTable usage with <!-- @vue-generic {Type} --> comment, toolbar, pagination",
      });

      patterns.push({
        name: "composable-list-complete",
        description: "List composable pattern with useApiClient + useAsync",
        code: "Reference: examples/patterns/composable-list-complete.md - Shows useApiClient(ClientClass) → getApiClient() → command objects, useAsync for loading, computed properties for pagination",
      });

      if (context.features.includes("filters")) {
        patterns.push({
          name: "filters-pattern",
          description: "Filter panel with search and custom filters",
          code: "Reference: examples/compositions/list/filters-pattern.md",
        });
      }

      if (context.features.includes("multiselect")) {
        patterns.push({
          name: "multiselect-pattern",
          description: "Multi-select pattern with bulk operations",
          code: "Reference: examples/compositions/list/multiselect.md",
        });
      }
    }

    if (context.type === "details") {
      patterns.push({
        name: "blade-details-complete",
        description: "Complete details blade pattern with VcForm (READ THIS CAREFULLY)",
        code: "Reference: examples/patterns/blade-details-complete.md - Shows correct props/emits structure, Field wrapper for validation, useModificationTracker, useBeforeUnload usage",
      });

      patterns.push({
        name: "composable-details-complete",
        description: "Details composable pattern with useApiClient + useAsync + useModificationTracker",
        code: "Reference: examples/patterns/composable-details-complete.md - Shows useModificationTracker with currentValue/isModified/resetModificationState, useAsync for CRUD operations",
      });

      if (context.features.includes("validation")) {
        patterns.push({
          name: "validation-pattern",
          description: "Form validation with vee-validate and Field wrapper",
          code: "Reference: examples/compositions/details/validation-patterns.md - IMPORTANT: Only wrap inputs WITH validation rules in Field component",
        });
      }

      if (context.features.includes("gallery")) {
        patterns.push({
          name: "gallery-pattern",
          description: "Image gallery patterns with VcGallery",
          code: "Reference: examples/compositions/details/gallery-patterns.md",
        });
      }
    }

    // Add domain events pattern if needed
    if (context.blade?.defineOptions?.notifyType) {
      patterns.push({
        name: "domain-events",
        description: "CRITICAL: Domain events pattern - NEVER use window.addEventListener!",
        code: "Reference: examples/patterns/domain-events.md - Shows useNotifications + setNotificationHandler, explains why window.addEventListener is WRONG",
      });
    }

    // Add component-specific patterns
    const usedComponents = this.extractUsedComponents(context);
    if (usedComponents.includes("VcSelect") && this.hasCustomSlot(context, "option")) {
      patterns.push({
        name: "VcSelect-slot-option",
        description: "CRITICAL: VcSelect #option slot uses { opt }, NOT { option }!",
        code: "Reference: examples/capabilities/VcSelect/slot-option.md - Slot scope: { opt, index, selected, toggleOption }",
      });
    }

    if (usedComponents.includes("VcTable")) {
      patterns.push({
        name: "VcTable-generic-SFC",
        description: "CRITICAL: VcTable REQUIRES <!-- @vue-generic {Type} --> comment on FIRST LINE!",
        code: "Reference: examples/capabilities/VcTable/GENERIC_SFC.md - WITHOUT this comment, TypeScript will fail!",
      });
    }

    return patterns;
  }

  /**
   * Extract critical pattern rules that MUST be followed
   */
  private getCriticalPatternRules(context: BladeGenerationContext): string {
    return `
# CRITICAL PATTERN RULES - MUST FOLLOW

## 1. BLADE PROPS/EMITS STRUCTURE (MANDATORY)
\`\`\`typescript
export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}
\`\`\`

## 2. API CLIENT PATTERN (MANDATORY)
✅ CORRECT:
\`\`\`typescript
const { getApiClient } = useApiClient(ClientClass);
const client = await getApiClient();
const result = await client.methodName(new CommandObject(data));
\`\`\`

❌ WRONG:
\`\`\`typescript
const apiClient = useApiClient(); // Missing client class!
await apiClient.method({ ... }); // No command object!
\`\`\`

## 3. ASYNC OPERATIONS (MANDATORY)
✅ CORRECT:
\`\`\`typescript
const { action: loadData, loading } = useAsync(async () => {
  // async logic
});
\`\`\`

❌ WRONG:
\`\`\`typescript
const loading = ref(false);
loading.value = true; // Manual state management!
\`\`\`

## 4. MODIFICATION TRACKING (MANDATORY for details)
${context.type === 'details' ? `
✅ CORRECT:
\`\`\`typescript
const { currentValue, isModified, resetModificationState } = useModificationTracker(entity);

// After save:
resetModificationState();

// Return currentValue, not original ref:
return {
  entity: currentValue,
  modified: isModified,
};
\`\`\`
` : ''}

## 5. FORM VALIDATION (IMPORTANT)
✅ Field wrapper ONLY for inputs WITH validation:
\`\`\`vue
<Field v-slot="{ errorMessage, handleChange, errors }" rules="required">
  <VcInput v-model="value" @update:model-value="handleChange" />
</Field>
\`\`\`

✅ NO Field wrapper for inputs WITHOUT validation:
\`\`\`vue
<VcInput v-model="description" />
\`\`\`

## 6. BLADE CLOSE (MANDATORY)
✅ Close self: \`emit("close:blade")\`
❌ WRONG: \`closeBlade(currentBladeNavigationData.value.idx)\`

## 7. DOMAIN EVENTS (MANDATORY)
❌ NEVER: \`window.addEventListener('DomainEvent', ...)\`
✅ ALWAYS: \`useNotifications('DomainEvent') + setNotificationHandler\`

## 8. MODULE INDEX FILE (MANDATORY)
✅ CORRECT: \`createAppModule(pages, locales, notificationTemplates)\`
❌ WRONG: \`createDynamicAppModule({ ... })\`

## 9. MAIN.TS REGISTRATION (MANDATORY - AI_FULL ONLY)
⚠️ **FOR AI_FULL STRATEGY**: Module registration is AUTOMATED by the system.
✅ **DO NOT** tell AI to modify bootstrap.ts or use registerModule()
✅ **DO NOT** tell AI to use addMenuItem() in bootstrap.ts
✅ System automatically adds to main.ts:
\`\`\`typescript
import {ModuleName}Module from "./modules/{module}";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use({ModuleName}Module, { router })  // ← Automatically added
  .use(router);
\`\`\`

## 9a. MENU ITEMS (MANDATORY - WORKSPACE BLADES)
⚠️ **CRITICAL**: Menu items are defined in workspace blade's \`defineOptions\`, NOT in bootstrap.ts!
❌ WRONG: \`addMenuItem()\` in bootstrap.ts
✅ CORRECT: Define \`menuItem\` in workspace blade's \`defineOptions\`:
\`\`\`typescript
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← Required for workspace
  menuItem: {         // ← Menu item configuration
    title: "OFFERS.MENU.TITLE",  // Use i18n key
    icon: "fas fa-tags",
    priority: 10,
  },
});
\`\`\`
**WHY**: Framework automatically registers menu items from workspace blades.
**bootstrap.ts**: ONLY for dashboard widgets (\`registerDashboardWidget\`), NOT menu items!

## 10. VCTABLE GENERIC (MANDATORY)
✅ FIRST LINE: \`<!-- @vue-generic {IEntityType} -->\`
❌ Missing this = TypeScript errors!

## 11. VCSELECT SLOT (MANDATORY)
✅ CORRECT: \`#option="{ opt, selected }"\`
❌ WRONG: \`#option="{ option }"\` (doesn't exist!)

## 12. ICONS (FLEXIBLE)
✅ All valid: material-, bi-, lucide-, fas fa-, svg:
Example: material-save, bi-house, fas fa-home

## 13. BROWSER UNLOAD PREVENTION (MANDATORY - DETAILS BLADES)
❌ NEVER use \`window.onbeforeunload\` manually:
\`\`\`typescript
// ❌ WRONG - Manual window.onbeforeunload
watch(modified, (isModified) => {
  if (isModified) {
    window.onbeforeunload = () => t("COMMON.UNSAVED_CHANGES");
  } else {
    window.onbeforeunload = null;
  }
});
\`\`\`

✅ ALWAYS use \`useBeforeUnload(modifiedRef)\`:
\`\`\`typescript
// ✅ CORRECT - useBeforeUnload composable
import { useBeforeUnload } from '@vc-shell/framework';

const modified = ref(false);
useBeforeUnload(modified);  // Pass ref directly, NOT a function!
\`\`\`

**WHY**: Framework handles cleanup, prevents memory leaks, works with blade system.

## 14. BLADE CLOSE CONFIRMATION (MANDATORY - DETAILS BLADES)
❌ NEVER use manual \`confirm()\` in close handler:
\`\`\`typescript
// ❌ WRONG - Manual confirm
function onClose() {
  if (modified.value) {
    const confirmed = confirm(t("COMMON.UNSAVED_CHANGES"));
    if (!confirmed) return;
  }
  emit("close:blade");
}
\`\`\`

✅ ALWAYS use \`onBeforeClose\` hook with \`showConfirmation\`:
\`\`\`typescript
// ✅ CORRECT - onBeforeClose hook
import { onBeforeClose } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }
  // Return nothing or true to allow close
});

// DON'T emit close:blade manually - framework handles it
\`\`\`

**WHY**: Async confirmation, better UX, integrates with blade navigation system.

See detailed examples in blade-list-complete.md and blade-details-complete.md!
`;
  }

  /**
   * Extract components used in the blade
   */
  private extractUsedComponents(context: BladeGenerationContext): string[] {
    const components = [];

    if (context.type === "list") {
      components.push("VcBlade", "VcTable");
    } else {
      components.push("VcBlade", "VcForm");
    }

    // Check for features that require specific components
    if (context.features.includes("gallery")) {
      components.push("VcGallery");
    }

    // Check for fields that might use VcSelect
    if (context.fields?.some((f) => f.as === "select")) {
      components.push("VcSelect");
    }

    return components;
  }

  /**
   * Check if blade has custom slot usage
   */
  private hasCustomSlot(context: BladeGenerationContext, slotName: string): boolean {
    return context.blade?.customSlots?.some((slot) => slot.name === slotName) || false;
  }

  private getComponentsDocs(componentNames: string[]): string {
    // Would fetch from registry in real implementation
    return componentNames.map((name) => `See component documentation: examples/components/${name}-demo.md`).join("\n");
  }
}
