import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
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

export const GlobalFilters: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);

      const statusOptions = [
        { value: "In Stock", label: "In Stock" },
        { value: "Out of Stock", label: "Out of Stock" },
        { value: "Low Stock", label: "Low Stock" },
      ];

      const currencyOptions = [
        { value: "USD", label: "US Dollar" },
        { value: "EUR", label: "Euro" },
        { value: "GBP", label: "British Pound" },
      ];

      // Global filter definitions
      const globalFilters = [
        {
          id: "search",
          label: "Search by name",
          filter: true,
          placeholder: "Type product name...",
        },
        {
          id: "status",
          label: "Status",
          filter: { options: statusOptions },
          placeholder: "Select status",
        },
        {
          id: "currency",
          label: "Currency",
          filter: { options: currencyOptions, multiple: true },
          placeholder: "Select currencies",
        },
        {
          id: "created",
          label: "Created Date",
          filter: { range: ["createdFrom", "createdTo"] },
        },
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
        if (filterLog.value.length > 8) filterLog.value.pop();

        // Client-side filtering demo
        if (Object.keys(filters).length === 0) {
          products.value = [...mockProducts];
        } else {
          products.value = mockProducts.filter((p) => {
            if (filters.search && !p.name.toLowerCase().includes(String(filters.search).toLowerCase())) {
              return false;
            }
            if (filters.status && p.status !== filters.status) {
              return false;
            }
            if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
              if (!filters.currency.includes(p.currency)) {
                return false;
              }
            }
            if (filters.createdFrom || filters.createdTo) {
              const created = p.createdAt.getTime();
              if (filters.createdFrom && created < new Date(filters.createdFrom as string).getTime()) {
                return false;
              }
              if (filters.createdTo && created > new Date(filters.createdTo as string).getTime()) {
                return false;
              }
            }
            return true;
          });
        }
      };

      return { products, globalFilters, filterLog, activeFilters, handleFilter };
    },
    template: `
    <div style="height: 650px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-accent-50 tw-to-info-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Global Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">globalFilters</code> prop renders a
          "Filters" button above the table. Click it to open a panel with text, select, multi-select
          and date-range filters. The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@filter</code> event
          emits a single flat payload merging both column and global filter values.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Configured Global Filters:</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li><strong>Search:</strong> Text filter</li>
              <li><strong>Status:</strong> Single select</li>
              <li><strong>Currency:</strong> Multi-select</li>
              <li><strong>Created Date:</strong> Date range (createdFrom / createdTo)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-24">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet — click the "Filters" button above the table</div>
      </div>

      <VcDataTable
        :items="products"
        :global-filters="globalFilters"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
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
        />
        <VcColumn
          id="currency"
          field="currency"
          title="Currency"
        />
        <VcColumn
          id="createdAt"
          field="createdAt"
          title="Created Date"
          type="date"
        />
      </VcDataTable>
    </div>
  `,
  }),
};
GlobalFilters.parameters = {
  docs: {
    description: {
      story:
        "Global filters rendered via the `globalFilters` prop. A 'Filters' button appears above the table. " +
        "The panel supports text, single/multi select, and date range filters. " +
        "The @filter event emits a flat object combining both column and global filter values.",
    },
  },
};

/**
 * Global Filters + Column Filters Combined
 *
 * Both `globalFilters` prop and column-level `filter` props work together.
 * The `@filter` event merges payloads from both into a single flat object.
 */

export const GlobalAndColumnFiltersCombined: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);

      const statusOptions = [
        { value: "In Stock", label: "In Stock" },
        { value: "Out of Stock", label: "Out of Stock" },
        { value: "Low Stock", label: "Low Stock" },
      ];

      const currencyOptions = [
        { value: "USD", label: "US Dollar" },
        { value: "EUR", label: "Euro" },
      ];

      // Global filters — search + date range
      const globalFilters = [
        {
          id: "search",
          label: "Quick Search",
          filter: true,
          placeholder: "Search products...",
        },
        {
          id: "created",
          label: "Created Date",
          filter: { range: ["createdFrom", "createdTo"] },
        },
      ];

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
        if (filterLog.value.length > 8) filterLog.value.pop();

        // Client-side filtering demo
        if (Object.keys(filters).length === 0) {
          products.value = [...mockProducts];
        } else {
          products.value = mockProducts.filter((p) => {
            if (filters.search && !p.name.toLowerCase().includes(String(filters.search).toLowerCase())) {
              return false;
            }
            if (filters.name && !p.name.toLowerCase().includes(String(filters.name).toLowerCase())) {
              return false;
            }
            if (filters.status && p.status !== filters.status) {
              return false;
            }
            if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
              if (!filters.currency.includes(p.currency)) {
                return false;
              }
            }
            if (filters.createdFrom || filters.createdTo) {
              const created = p.createdAt.getTime();
              if (filters.createdFrom && created < new Date(filters.createdFrom as string).getTime()) {
                return false;
              }
              if (filters.createdTo && created > new Date(filters.createdTo as string).getTime()) {
                return false;
              }
            }
            return true;
          });
        }
      };

      return { products, statusOptions, currencyOptions, globalFilters, filterLog, activeFilters, handleFilter };
    },
    template: `
    <div style="height: 650px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-warning-50 tw-to-warning-100 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Global + Column Filters Combined</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Both <code class="tw-bg-additional-50 tw-px-1 tw-rounded">globalFilters</code> (button above table) and
          column-level <code class="tw-bg-additional-50 tw-px-1 tw-rounded">filter</code> props (icons in headers)
          work together. The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@filter</code> event merges
          both payloads into a single flat object for the backend.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Global Filters (button panel):</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li>Quick Search (text)</li>
              <li>Created Date (date range)</li>
            </ul>
            <p class="tw-font-medium tw-mt-2 tw-mb-1">Column Filters (header icons):</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li>Name (text)</li>
              <li>Status (select)</li>
              <li>Currency (multi-select)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Merged Payload:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-28">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">Try both: click column filter icons and the "Filters" button</div>
      </div>

      <VcDataTable
        :items="products"
        :global-filters="globalFilters"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
          filter-placeholder="Filter by name..."
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
        />
      </VcDataTable>
    </div>
  `,
  }),
};
GlobalAndColumnFiltersCombined.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates combining global filters (via `globalFilters` prop) with per-column filters (via `filter` prop on VcColumn). " +
        "Both filter types merge their values into a single flat @filter payload.",
    },
  },
};

/**
 * Inline Search Bar
 *
 * Use the `searchable` prop to show a built-in search bar above the table.
 * The `@search` event is debounced (default 300ms) — use it for backend filtering.
 * Use `v-model:search-value` for two-way binding of the input value.
 */
