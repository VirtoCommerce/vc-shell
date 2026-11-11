import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, ref } from "vue";
import { VcButton } from "@ui/components/atoms";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import type { GlobalFilterConfig } from "@ui/components/organisms/vc-data-table/types";
import type { SearchBarView } from "@ui/components/organisms/vc-search-bar";
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

export const SearchBar: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const searchValue = ref("");
      const searchLog = ref<string[]>([]);

      const handleSearch = (value: string) => {
        searchLog.value.unshift(`search: "${value}" (${new Date().toLocaleTimeString()})`);
        if (searchLog.value.length > 6) searchLog.value.pop();

        // Client-side filtering demo
        if (!value) {
          products.value = [...mockProducts];
        } else {
          const q = value.toLowerCase();
          products.value = mockProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.status.toLowerCase().includes(q) ||
              p.currency.toLowerCase().includes(q),
          );
        }
      };

      return { products, searchValue, searchLog, handleSearch };
    },
    template: `
    <div style="height: 550px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-primary-50 tw-to-info-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Inline Search Bar</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Add <code class="tw-bg-additional-50 tw-px-1 tw-rounded">searchable</code> to show a search bar above the table.
          The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@search</code> event is debounced (300ms by default).
          Use <code class="tw-bg-additional-50 tw-px-1 tw-rounded">v-model:search-value</code> for two-way binding.
        </p>
        <p class="tw-text-sm"><strong>Current value:</strong> "{{ searchValue }}"</p>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in searchLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!searchLog.length" class="tw-text-neutrals-400">Type in the search bar to see debounced events here</div>
      </div>

      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Search products by name, status, or currency..."
        :search-debounce="300"
        @search="handleSearch"
      >
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="currency" field="currency" title="Currency" />
      </VcDataTable>
    </div>
  `,
  }),
};
SearchBar.parameters = {
  docs: {
    description: {
      story:
        "Built-in search bar rendered via the `searchable` prop. " +
        "The `@search` event emits the search value after a configurable debounce delay (default 300ms). " +
        "Use `v-model:search-value` for two-way binding and `search-placeholder` for custom placeholder text.",
    },
  },
};

/**
 * Search Bar + Global Filters Combined
 *
 * When both `searchable` and `globalFilters` are provided, the search bar and the
 * global filters button appear together in a single header row.
 * The `@search` event handles the search input, while `@filter` handles the global filters.
 */

export const SearchWithGlobalFilters: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const searchValue = ref("");
      const eventLog = ref<string[]>([]);
      const activeFilters = ref<Record<string, unknown>>({});

      const statusOptions = [
        { value: "In Stock", label: "In Stock" },
        { value: "Out of Stock", label: "Out of Stock" },
        { value: "Low Stock", label: "Low Stock" },
      ];

      const currencyOptions = [
        { value: "USD", label: "US Dollar" },
        { value: "EUR", label: "Euro" },
      ];

      const globalFilters = [
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
      ];

      const applyFiltering = () => {
        let result = [...mockProducts];
        const q = searchValue.value.toLowerCase();
        if (q) {
          result = result.filter((p) => p.name.toLowerCase().includes(q));
        }
        const filters = activeFilters.value;
        if (filters.status) {
          result = result.filter((p) => p.status === filters.status);
        }
        if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
          result = result.filter((p) => (filters.currency as string[]).includes(p.currency));
        }
        products.value = result;
      };

      const handleSearch = (value: string) => {
        eventLog.value.unshift(`@search: "${value}"`);
        if (eventLog.value.length > 6) eventLog.value.pop();
        applyFiltering();
      };

      const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
        activeFilters.value = event.filters;
        const parts = Object.entries(event.filters).map(([k, v]) => k + "=" + JSON.stringify(v));
        eventLog.value.unshift(`@filter: { ${parts.join(", ") || "empty"} }`);
        if (eventLog.value.length > 6) eventLog.value.pop();
        applyFiltering();
      };

      return { products, searchValue, globalFilters, eventLog, activeFilters, handleSearch, handleFilter };
    },
    template: `
    <div style="height: 600px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-accent-50 tw-to-primary-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Search + Global Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          When both <code class="tw-bg-additional-50 tw-px-1 tw-rounded">searchable</code> and
          <code class="tw-bg-additional-50 tw-px-1 tw-rounded">global-filters</code> are provided,
          the search bar and the "Filters" button appear together in a single header row.
        </p>
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Search:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs">"{{ searchValue }}"</pre>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-12">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in eventLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!eventLog.length" class="tw-text-neutrals-400">Type in the search bar or use global filters to see events here</div>
      </div>

      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Search by product name..."
        :global-filters="globalFilters"
        @search="handleSearch"
        @filter="handleFilter"
      >
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="currency" field="currency" title="Currency" />
      </VcDataTable>
    </div>
  `,
  }),
};
SearchWithGlobalFilters.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates the search bar and global filters combined in a single header row. " +
        "The search bar emits `@search` (debounced), while global filters emit `@filter`. " +
        "Both can be used together for comprehensive backend-driven filtering.",
    },
  },
};

/**
 * Empty state using the declarative `emptyState` prop (TableStateConfig).
 * Shown when `items` is empty and there is no active search or filters.
 */

/** With `searchBar`, custom `#search-header-actions` get their own left-aligned row above the search bar, inside the table's header. */
export const SearchWithHeaderActions: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn, VcButton },
    setup() {
      const products = ref([...mockProducts]);
      const view = ref<"list" | "grid">("list");
      const globalFilters: GlobalFilterConfig[] = [
        {
          id: "status",
          label: "Status",
          filter: { options: ["In Stock", "Low Stock", "Out of Stock"].map((s) => ({ value: s, label: s })) },
        },
        { id: "created", label: "Created", filter: { range: ["createdFrom", "createdTo"] } },
      ];
      const handleFilter = ({ filters }: { filters: Record<string, unknown> }) => {
        products.value = mockProducts.filter((p) => !filters.status || p.status === filters.status);
      };
      return { products, view, globalFilters, handleFilter };
    },
    template: `
    <div style="height: 520px" class="tw-overflow-hidden">
      <VcDataTable :items="products" searchable search-bar :global-filters="globalFilters" @filter="handleFilter">
        <template #search-header-actions>
          <VcButton icon="lucide-list" size="sm" variant="outline" :selected="view === 'list'" :aria-pressed="view === 'list'" @click="view = 'list'">List</VcButton>
          <VcButton icon="lucide-layout-grid" size="sm" variant="outline" :selected="view === 'grid'" :aria-pressed="view === 'grid'" @click="view = 'grid'">Grid</VcButton>
        </template>
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="createdAt" field="createdAt" title="Created Date" type="date" />
      </VcDataTable>
    </div>
  `,
  }),
};

// Opt-in bar stories: products filtered on the client, the way a screen loads them from @filter and @search
const STOCK = ["In Stock", "Low Stock", "Out of Stock", "Discontinued"];
const stockFilters: GlobalFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    filter: { options: STOCK.map((s) => ({ value: s, label: s })), multiple: true },
  },
  { id: "currency", label: "Currency", filter: { options: ["USD", "EUR"].map((c) => ({ value: c, label: c })) } },
  { id: "created", label: "Created", filter: { range: ["createdFrom", "createdTo"] } },
];
const barKey = (name: string) => `story-table-opt-in-${name}-${Math.random().toString(36).slice(2, 8)}`;

const optInTable = (o: { views: SearchBarView[]; search?: string }) => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const filters = ref<Record<string, unknown>>({});
    const search = ref(o.search ?? "");
    const products = computed(() =>
      mockProducts.filter((p) => {
        const status = filters.value.status as string[] | undefined;
        if (status?.length && !status.includes(p.status)) return false;
        if (filters.value.currency && p.currency !== filters.value.currency) return false;
        return !search.value || p.name.toLowerCase().includes(search.value.toLowerCase());
      }),
    );
    const onFilter = (e: { filters: Record<string, unknown> }) => (filters.value = e.filters);
    return {
      products,
      search,
      onFilter,
      views: o.views,
      stockFilters,
      stateKey: barKey("table"),
      total: mockProducts.length,
    };
  },
  template: `
    <div style="height: 560px" class="tw-overflow-hidden">
      <VcDataTable
        :items="products"
        :state-key="stateKey"
        searchable
        search-bar
        v-model:search-value="search"
        :global-filters="stockFilters"
        :search-views="views"
        :pagination="{ currentPage: 1, pages: 1 }"
        :total-count="products.length"
        :unfiltered-count="total"
        @filter="onFilter"
      >
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="currency" field="currency" title="Currency" />
        <VcColumn id="price" field="price" title="Price" type="money" />
      </VcDataTable>
    </div>`,
});

const stockViews: SearchBarView[] = [
  { id: "available", name: "Available", values: { status: ["In Stock", "Low Stock"] }, default: true },
  { id: "usd", name: "USD", values: { currency: "USD" } },
];

/**
 * `search-bar` turns on VcSearchBar: chips in the row, the Filters panel and views. The footer reads
 * "filtered from M · K filters · Clear all" next to the range while bar filters or search apply.
 */
export const SearchBarOptIn: Story = {
  render: () => optInTable({ views: stockViews }),
};

/** An empty result caused by the bar names the reason, lists the filters as removable tags and offers to clear them. */
export const SearchBarNoResults: Story = {
  render: () =>
    optInTable({
      views: [{ id: "gone", name: "Discontinued", values: { status: ["Discontinued"] }, default: true }],
      search: "pro",
    }),
};

/**
 * The same table and `#search-header-actions` without and with `search-bar`. Without it the classic header
 * stays as in v2.11.0: search, the actions and the global filters button in one row. With it the actions get
 * their own row above the bar.
 */
export const SearchHeaderWithAndWithoutBar: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn, VcButton },
    setup: () => ({ products: mockProducts.slice(0, 3), stockFilters, stateKey: barKey("compare") }),
    template: `
    <div class="tw-flex tw-flex-col tw-gap-6">
      <section v-for="bar in [false, true]" :key="String(bar)" style="height: 300px" class="tw-overflow-hidden">
        <p class="tw-text-sm tw-font-semibold tw-mb-2">{{ bar ? "With search-bar" : "Without search-bar (default)" }}</p>
        <VcDataTable :items="products" :state-key="stateKey + bar" searchable :search-bar="bar" :global-filters="stockFilters">
          <template #search-header-actions>
            <VcButton icon="lucide-download" size="sm" variant="outline">Export</VcButton>
          </template>
          <VcColumn id="name" field="name" title="Product Name" />
          <VcColumn id="status" field="status" title="Status" />
          <VcColumn id="currency" field="currency" title="Currency" />
        </VcDataTable>
      </section>
    </div>`,
  }),
};
