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

export const BuiltInColumnSwitcher: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      return { products };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Built-in Column Switcher (Auto)</p>
        <p class="tw-text-neutrals-600">
          Only 3 columns are declared (<code>name</code>, <code>price</code>, <code>stock</code>).
          The switcher auto-discovers remaining fields from data:
          <code>id</code>, <code>currency</code>, <code>status</code>,
          <code>isActive</code>, <code>createdAt</code>.
          Toggle them on to see them appear in the table.
        </p>
      </div>

      <VcDataTable
        :items="products"
        column-switcher
        searchable
        search-placeholder="Search products..."
        @search="(v) => console.log('search:', v)"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * Column Switcher — Defined Mode
 *
 * Uses `column-switcher="defined"` to only show declared VcColumns in the switcher.
 * No auto-discovery from data keys.
 */

export const ColumnSwitcherDefined: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      return { products };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Column Switcher (Defined Mode)</p>
        <p class="tw-text-neutrals-600">
          Only declared VcColumns appear in the switcher — no auto-discovered columns.
        </p>
      </div>

      <VcDataTable
        :items="products"
        column-switcher="defined"
        searchable
        search-placeholder="Search products..."
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
        <VcColumn id="status" field="status" title="Status" width="120px" />
        <VcColumn id="createdAt" field="createdAt" title="Created" type="date" width="150px" />
        <VcColumn id="currency" field="currency" title="Currency" width="100px" />
      </VcDataTable>
    </div>
  `,
  }),
};

// =============================================================================
// ROW GROUPING
// =============================================================================

/**
 * Row Grouping by Status
 *
 * Demonstrates grouping rows by a field value within a single table.
 * Groups can be expanded/collapsed.
 */

export const WithRowGrouping: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const expandedGroups = ref<string[]>(["In Stock", "Low Stock", "Out of Stock"]);

      return { products, expandedGroups };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping</p>
        <p class="tw-text-neutrals-600">Products are grouped by their status in a single table. Click group headers to expand/collapse.</p>
        <p class="tw-text-neutrals-500 tw-mt-1">Expanded groups: {{ expandedGroups.join(', ') }}</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="true"
        v-model:expanded-row-groups="expandedGroups"
        @rowgroup-expand="(e) => console.log('Group expanded:', e.data)"
        @rowgroup-collapse="(e) => console.log('Group collapsed:', e.data)"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * Row Grouping with Footer
 *
 * Demonstrates row grouping with a custom footer for each group.
 */

export const WithRowGroupingFooter: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const expandedGroups = ref<string[]>(["In Stock", "Low Stock", "Out of Stock"]);

      // Calculate totals per group
      const getGroupTotal = (status: string) => {
        return products.value
          .filter((p) => p.status === status)
          .reduce((sum, p) => sum + p.price, 0)
          .toFixed(2);
      };

      return { products, expandedGroups, getGroupTotal };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping with Footer</p>
        <p class="tw-text-neutrals-600">Each group has a footer showing the total price for that group.</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="true"
        v-model:expanded-row-groups="expandedGroups"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>

        <template #groupfooter="{ data }">
          <div class="tw-flex tw-justify-end tw-gap-4">
            <span class="tw-text-neutrals-600">Total for {{ data.status }}:</span>
            <span class="tw-font-semibold">\${{ getGroupTotal(data.status) }}</span>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * Row Grouping Non-Expandable
 *
 * Demonstrates row grouping where groups cannot be collapsed (always expanded).
 */

export const WithRowGroupingNonExpandable: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      return { products };
    },
    template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping (Non-Expandable)</p>
        <p class="tw-text-neutrals-600">Groups are always expanded and cannot be collapsed.</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="false"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>
      </VcDataTable>
    </div>
  `,
  }),
};

// =============================================================================
// INFINITE SCROLL
// =============================================================================

/**
 * Infinite Scroll
 *
 * Demonstrates loading more data as the user scrolls near the bottom of the table.
 * Uses `infinite-scroll` prop + `@load-more` event. Pagination prop remains as an alternative.
 */

export const InfiniteScroll: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const PAGE_SIZE = 20;
      let nextId = 1;

      const generatePage = (count: number) => {
        const statuses = ["In Stock", "Out of Stock", "Low Stock"];
        return Array.from({ length: count }, () => ({
          id: nextId++,
          name: `Product ${nextId - 1}`,
          price: Math.round(Math.random() * 1000 * 100) / 100,
          currency: "USD",
          stock: Math.floor(Math.random() * 200),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          isActive: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        }));
      };

      const products = ref(generatePage(PAGE_SIZE));
      const loading = ref(false);
      const hasMore = ref(true);
      const loadCount = ref(0);

      const loadMore = () => {
        if (loading.value || !hasMore.value) return;
        loading.value = true;
        loadCount.value++;
        // Simulate async fetch
        setTimeout(() => {
          const newItems = generatePage(PAGE_SIZE);
          products.value = [...products.value, ...newItems];
          loading.value = false;
          // Stop after 5 pages (100 items total)
          if (products.value.length >= 100) {
            hasMore.value = false;
          }
        }, 800);
      };

      return { products, loading, hasMore, loadMore, loadCount };
    },
    template: `
    <div>
      <div class="tw-mb-2 tw-text-sm tw-text-neutrals-500">
        Loaded: {{ products.length }} items | Fetches: {{ loadCount }} | {{ hasMore ? 'Scroll down to load more...' : 'All items loaded' }}
      </div>
      <VcDataTable
        :items="products"
        :loading="loading"
        :infinite-scroll="hasMore"
        :infinite-scroll-distance="150"
        scroll-height="400px"
        @load-more="loadMore"
      >
        <VcColumn id="id" field="id" title="ID" width="80px" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
        <VcColumn id="status" field="status" title="Status" type="status" width="120px" />
      </VcDataTable>
    </div>
  `,
  }),
};

// =============================================================================
// MOBILE VIEW
// =============================================================================

/**
 * Mobile View Info
 *
 * Real mobile card view with images. Uses `withMobileView` decorator
 * to inject `isMobile = true`, triggering the actual mobile layout.
 *
 * - `mobile-role="image"` - Product thumbnail on the left
 * - `mobile-role="title"` - Product name as primary identifier
 * - `mobile-role="field"` - Price and Stock as labeled fields
 * - `mobile-role="status"` - Status badge at bottom
 *
 * **Note:** View this story on a mobile viewport (375px) to see the full effect.
 */
