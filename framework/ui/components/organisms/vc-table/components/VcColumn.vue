<script lang="ts">
/**
 * VcColumn - Renderless column definition component for VcDataTable
 *
 * This component does not render any DOM elements. Instead, it registers itself
 * with the parent VcDataTable via inject/provide pattern.
 *
 * Usage:
 * ```vue
 * <VcDataTable :items="data">
 *   <VcColumn id="name" field="name" title="Name" sortable />
 *   <VcColumn id="price" field="price" title="Price" type="money">
 *     <template #editor="{ data, field }">
 *       <VcInputCurrency v-model="data[field]" />
 *     </template>
 *   </VcColumn>
 * </VcDataTable>
 * ```
 */
import { defineComponent, inject, onMounted, onUnmounted, getCurrentInstance } from "vue";
import type { PropType } from "vue";
import type { ColumnCollector } from "../utils/ColumnCollector";
import type { VcColumnProps, ColumnFilterConfig } from "../types";

// Cell type options matching existing cell formatters
export type CellType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "date-ago"
  | "time"
  | "datetime"
  | "image"
  | "link"
  | "html"
  | "status"
  | "status-icon";

export default defineComponent({
  name: "VcColumn",
  inheritAttrs: false,

  props: {
    // === Identity ===
    /** Unique column identifier (must be unique within the table) */
    id: {
      type: String,
      required: true,
    },
    /** Data field path to read from each item (default: same as `id`) */
    field: {
      type: String,
      default: undefined,
    },

    // === Display ===
    /** Column header title text */
    title: {
      type: String,
      default: undefined,
    },
    /** Cell formatter type — determines how cell value is rendered */
    type: {
      type: String as PropType<CellType>,
      default: "text",
    },
    /** Field name to read currency code from (used with `type="money"`, default: `"currency"`) */
    currencyField: {
      type: String,
      default: "currency",
    },
    /** Date/number format string (e.g. `"DD.MM.YYYY"`) */
    format: {
      type: String,
      default: undefined,
    },

    // === Sizing ===
    /** Column width in px or CSS string (e.g. `200`, `"150px"`) */
    width: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /** Minimum column width (default: `60px`) */
    minWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /** Maximum column width */
    maxWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },

    // === Alignment ===
    /** Cell text alignment */
    align: {
      type: String as PropType<"start" | "center" | "end">,
      default: undefined,
    },
    /** Header text alignment (default: same as `align`) */
    headerAlign: {
      type: String as PropType<"start" | "center" | "end">,
      default: undefined,
    },

    // === Sorting ===
    /** Whether the column is sortable (shows sort icon on hover) */
    sortable: {
      type: Boolean,
      default: false,
    },
    /** Override backend field name for sorting (default: column `id`) */
    sortField: {
      type: String,
      default: undefined,
    },

    // === Filtering ===
    /** Declarative filter config: `true` for text, `"field"` for text with custom field, or object for select/dateRange */
    filter: {
      type: [Boolean, String, Object] as PropType<ColumnFilterConfig>,
      default: undefined,
    },
    /** Override backend field name for filtering (default: column `id`) */
    filterField: {
      type: String,
      default: undefined,
    },
    /** Placeholder text for the filter input */
    filterPlaceholder: {
      type: String,
      default: undefined,
    },

    // === Visibility ===
    /** Whether the column is visible (default: `true`). Hidden columns can be toggled via column switcher */
    visible: {
      type: Boolean,
      default: true,
    },
    /** If `true`, column stays visible even when `showAllColumns=false` (e.g. when blade narrows) */
    alwaysVisible: {
      type: Boolean,
      default: false,
    },

    // === Editing ===
    /** Whether the cell is editable (enables inline edit on click) */
    editable: {
      type: Boolean,
      default: false,
    },
    /** Validation rules for the editable cell (field name → validator) */
    rules: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },

    // === Styling ===
    /** Custom CSS class applied to the entire column (header + body cells) */
    class: {
      type: String,
      default: undefined,
    },
    /** Custom CSS class applied only to the header cell */
    headerClass: {
      type: String,
      default: undefined,
    },
    /** Custom CSS class applied only to body cells */
    bodyClass: {
      type: String,
      default: undefined,
    },
    /** Number of lines to clamp cell text to (`0` = no clamp, default: `2`) */
    lineClamp: {
      type: Number,
      default: 2,
    },

    // === Special modes ===
    /** Renders a selection checkbox column (`"single"` = radio, `"multiple"` = checkbox) */
    selectionMode: {
      type: String as PropType<"single" | "multiple">,
      default: undefined,
    },
    /** Renders row edit save/cancel buttons in this column */
    rowEditor: {
      type: Boolean,
      default: false,
    },
    /** Renders a drag handle for row reordering */
    rowReorder: {
      type: Boolean,
      default: false,
    },
    /** Renders an expand/collapse toggle for row expansion */
    expander: {
      type: Boolean,
      default: false,
    },

    // === Mobile ===
    /**
     * Mobile card role — determines how column is displayed on mobile.
     * - `"title"`: Primary identifier, displayed at top (full width, bold)
     * - `"image"`: Visual element, displayed on left side
     * - `"field"`: Data with label, auto-distributed in 2x2 grid (max 4)
     * - `"status"`: Status badge, displayed at bottom (multiple allowed)
     */
    mobileRole: {
      type: String as PropType<"title" | "image" | "field" | "status">,
      default: undefined,
    },
    /** Explicit grid position for mobile card layout */
    mobilePosition: {
      type: String as PropType<"top-left" | "top-right" | "bottom-left" | "bottom-right">,
      default: undefined,
    },
    /** Whether column is visible on mobile (default: `true` — hidden unless `mobileRole` is specified) */
    mobileVisible: {
      type: Boolean,
      default: true,
    },
  },

  setup(props, { slots }) {
    // Inject the column collector from parent VcDataTable
    const $columns = inject<ColumnCollector | null>("$columns", null);
    const instance = getCurrentInstance();

    onMounted(() => {
      if ($columns && instance) {
        // Register this column with the parent
        $columns.add({
          instance,
          props: props as VcColumnProps,
          slots,
        });
      }
    });

    onUnmounted(() => {
      if ($columns && instance) {
        $columns.delete(instance);
      }
    });

    // Renderless component - returns null
    return () => null;
  },
});
</script>
