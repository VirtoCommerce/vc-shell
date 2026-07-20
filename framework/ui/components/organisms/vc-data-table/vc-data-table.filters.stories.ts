import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcInput } from "@ui/components/molecules";
import { mockProducts } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeclarativeFilters: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);

      // Status options for select filter
      const statusOptions = [
        { value: "In Stock", label: "In Stock" },
        { value: "Out of Stock", label: "Out of Stock" },
        { value: "Low Stock", label: "Low Stock" },
      ];

      // Currency options for multi-select filter
      const currencyOptions = [
        { value: "USD", label: "US Dollar" },
        { value: "EUR", label: "Euro" },
        { value: "GBP", label: "British Pound" },
      ];

      // Event log
      const filterLog = ref<string[]>([]);
      const activeFilters = ref<Record<string, unknown>>({});

      const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
        const filters = event.filters;
        activeFilters.value = filters;
        const entries = Object.entries(filters);
        const parts: string[] = [];
        for (const [k, v] of entries) {
          parts.push(k + "=" + JSON.stringify(v));
        }
        filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
        if (filterLog.value.length > 5) filterLog.value.pop();

        // Client-side filtering demo (in real app, you'd send to backend)
        if (Object.keys(filters).length === 0) {
          products.value = [...mockProducts];
        } else {
          products.value = mockProducts.filter((p) => {
            // Name text filter
            if (filters.name && !p.name.toLowerCase().includes(String(filters.name).toLowerCase())) {
              return false;
            }
            // Status select filter
            if (filters.status && p.status !== filters.status) {
              return false;
            }
            // Currency multi-select filter
            if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
              if (!filters.currency.includes(p.currency)) {
                return false;
              }
            }
            // Date range filter
            if (filters.startDate || filters.endDate) {
              const created = p.createdAt.getTime();
              if (filters.startDate && created < new Date(filters.startDate as string).getTime()) {
                return false;
              }
              if (filters.endDate && created > new Date(filters.endDate as string).getTime()) {
                return false;
              }
            }
            return true;
          });
        }
      };

      return { products, statusOptions, currencyOptions, filterLog, activeFilters, handleFilter };
    },
    template: `
    <div style="height: 600px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-primary-50 tw-to-primary-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Declarative Column Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Configure filters directly on columns using the <code class="tw-bg-additional-50 tw-px-1 tw-rounded">filter</code> prop.
          Click the filter icon (funnel) in column headers.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Filter Types:</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li><strong>Name:</strong> Text filter (<code>filter: true</code>)</li>
              <li><strong>Status:</strong> Single select (<code>filter: { options }</code>)</li>
              <li><strong>Currency:</strong> Multi-select (<code>filter: { options, multiple: true }</code>)</li>
              <li><strong>Created:</strong> Date range (<code>filter: { range: [...] }</code>)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-24">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet</div>
      </div>

      <VcDataTable
        :items="products"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
          filter-placeholder="Search by name..."
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
        />
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
          :filter="{ options: statusOptions }"
          filter-placeholder="Select status"
        />
        <VcColumn
          id="currency"
          field="currency"
          title="Currency"
          :filter="{ options: currencyOptions, multiple: true }"
          filter-placeholder="Select currencies"
        />
        <VcColumn
          id="createdAt"
          field="createdAt"
          title="Created Date"
          type="date"
          :filter="{ range: ['startDate', 'endDate'] }"
        />
      </VcDataTable>
    </div>
  `,
  }),
};
DeclarativeFilters.parameters = {
  docs: {
    description: {
      story:
        "Declarative filter configuration using the filter prop. Supports text, single/multi select, and date range filters. The @filter event emits a flat object ready for backend API calls.",
    },
  },
};

/**
 * Custom Filter Template
 *
 * Use the #filter slot for complete control over the filter UI.
 * The slot provides:
 * - value / updateValue — current value and setter
 * - startDate / updateStartDate — for date range
 * - endDate / updateEndDate — for date range
 * - applyFilter — apply and close
 * - clearFilter — clear and close
 *
 * Note: Clear/Apply buttons are provided by ColumnFilter overlay automatically.
 */

export const CustomFilterTemplate: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn, VcInput },
    setup() {
      const allProducts = [...mockProducts];
      const products = ref([...allProducts]);
      const filterLog = ref<string[]>([]);

      const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
        const filters = event.filters;

        // Log
        const entries = Object.entries(filters);
        const parts: string[] = [];
        for (const [k, v] of entries) {
          parts.push(k + "=" + JSON.stringify(v));
        }
        filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
        if (filterLog.value.length > 5) filterLog.value.pop();

        // Apply client-side filtering for demo
        let filtered = [...allProducts];

        // Text filter on name
        if (filters.name && typeof filters.name === "string") {
          const search = filters.name.toLowerCase();
          filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
        }

        // Price range filter
        if (filters.price && typeof filters.price === "object") {
          const range = filters.price as { min?: number; max?: number };
          if (range.min != null) {
            filtered = filtered.filter((p) => p.price >= Number(range.min));
          }
          if (range.max != null) {
            filtered = filtered.filter((p) => p.price <= Number(range.max));
          }
        }

        products.value = filtered;
      };

      return { products, filterLog, handleFilter };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Custom Filter Templates</p>
        <p class="tw-text-neutrals-600">
          Use the <code>#filter</code> slot for complete control over the filter UI.
          This example shows a custom price range filter with min/max inputs.
        </p>
        <p class="tw-text-neutrals-500 tw-text-xs tw-mt-1">
          Note: Clear/Apply buttons are provided automatically by the filter overlay.
        </p>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet</div>
      </div>

      <VcDataTable
        :items="products"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
          :filter="true"
        >
          <template #filter="{ value, updateValue }">
            <div class="tw-space-y-2">
              <p class="tw-text-xs tw-font-medium tw-text-neutrals-600">Price Range</p>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcInput
                  type="number"
                  placeholder="Min"
                  size="small"
                  :model-value="value?.min"
                  @update:model-value="(v) => updateValue({ ...value, min: v })"
                />
                <span class="tw-text-neutrals-400 tw-text-sm">—</span>
                <VcInput
                  type="number"
                  placeholder="Max"
                  size="small"
                  :model-value="value?.max"
                  @update:model-value="(v) => updateValue({ ...value, max: v })"
                />
              </div>
            </div>
          </template>
        </VcColumn>
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
        />
      </VcDataTable>
    </div>
  `,
  }),
};
CustomFilterTemplate.parameters = {
  docs: {
    description: {
      story:
        "Custom filter templates using the #filter slot. The slot provides updateValue for setting filter value. Clear/Apply buttons are provided automatically by the overlay.",
    },
  },
};

/**
 * Global Filters
 *
 * Use the `globalFilters` prop to render a "Filters" button above the table.
 * Clicking the button opens a panel with the configured filters.
 * The `@filter` event emits a flat payload that merges both column and global filter values.
 */
