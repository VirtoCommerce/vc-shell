import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { Product, mockProducts } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyStateConfig: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const actionClicked = ref(false);
      const emptyState = {
        icon: "lucide-package-open",
        title: "No products yet",
        description: "Your product catalog is empty. Add your first product to get started.",
        actionLabel: "Add Product",
        actionHandler: () => {
          actionClicked.value = true;
        },
      };
      return { products: [] as Product[], emptyState, actionClicked };
    },
    template: `
    <div style="height: 400px">
      <div v-if="actionClicked" class="tw-mb-2 tw-p-2 tw-bg-success-50 tw-rounded tw-text-sm tw-text-success-700">
        Action button clicked!
      </div>
      <VcDataTable :items="products" :empty-state="emptyState">
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
  }),
};
EmptyStateConfig.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates the declarative `emptyState` prop (`TableStateConfig`) — " +
        "icon, title, description, and an optional action button. " +
        "Shown when `items` is an empty array and no search/filter is active.",
    },
  },
};

/**
 * Not Found state using the declarative `notFoundState` prop (TableStateConfig).
 * Shown when `items` is empty AND there is an active search or filter.
 * The table uses `searchable` with a pre-filled search value to trigger the not-found state.
 */

export const NotFoundStateConfig: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const searchValue = ref("nonexistent product xyz");
      const actionClicked = ref(false);

      const notFoundState = {
        icon: "lucide-search",
        title: "No results found",
        description: "We couldn't find any products matching your search. Try adjusting your query.",
        actionLabel: "Clear Search",
        actionHandler: () => {
          searchValue.value = "";
          actionClicked.value = true;
        },
      };

      const emptyState = {
        icon: "lucide-package-open",
        title: "No products yet",
        description: "Your product catalog is empty.",
      };

      return { products: [] as Product[], searchValue, notFoundState, emptyState, actionClicked };
    },
    template: `
    <div style="height: 400px">
      <div v-if="actionClicked" class="tw-mb-2 tw-p-2 tw-bg-success-50 tw-rounded tw-text-sm tw-text-success-700">
        Search cleared! (In a real app, items would reload and show the empty state instead.)
      </div>
      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Search products..."
        :not-found-state="notFoundState"
        :empty-state="emptyState"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
  }),
};
NotFoundStateConfig.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates the `notFoundState` prop — shown instead of `emptyState` when items " +
        "is empty AND there is an active search query or filters. " +
        "The action button clears the search. Both `emptyState` and `notFoundState` " +
        "can be provided simultaneously — the table picks the right one based on context.",
    },
  },
};

/**
 * Both empty and not-found states — interactive demo.
 * Search to switch between the two states.
 */

export const EmptyVsNotFound: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const searchValue = ref("");

      const emptyState = {
        icon: "lucide-package-open",
        title: "No products yet",
        description: "Your catalog is empty. Add your first product to get started.",
        actionLabel: "Add Product",
        actionHandler: () => alert("Add product clicked!"),
      };

      const notFoundState = {
        icon: "lucide-search",
        title: "Nothing matches your search",
        description: "Try a different search term or clear the search field.",
        actionLabel: "Clear Search",
        actionHandler: () => {
          searchValue.value = "";
        },
      };

      return { products: [] as Product[], searchValue, emptyState, notFoundState };
    },
    template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-gradient-to-r tw-from-accent-50 tw-to-primary-50 tw-rounded-lg tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Empty vs Not Found</p>
        <p class="tw-text-neutrals-600">
          Type anything in the search bar to switch from <strong>empty state</strong> to <strong>not found state</strong>.
          Clear the search to go back to empty state.
        </p>
      </div>
      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Type to trigger not-found state..."
        :empty-state="emptyState"
        :not-found-state="notFoundState"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
  }),
};
EmptyVsNotFound.parameters = {
  docs: {
    description: {
      story:
        "Interactive demo showing the difference between empty and not-found states. " +
        "With an empty search field the table shows the `emptyState` config. " +
        "Type anything in the search bar to see the `notFoundState` config instead. " +
        "The table automatically switches between the two based on whether a search/filter is active.",
    },
  },
};

/**
 * Demonstrates `fit-mode="fit"` — columns expand to fill the entire table width.
 * Columns with explicit px widths are used as proportional hints; the engine
 * distributes all available space so no filler gap appears on the right.
 */

export const FitMode: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        fit-mode="fit": columns expand proportionally to fill the full table width — no trailing gap.
      </p>
      <VcDataTable :items="products" fit-mode="fit">
        <VcColumn id="name" field="name" title="Name" width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" width="130" />
        <VcColumn id="currency" field="currency" title="Currency" />
      </VcDataTable>
    </div>
  `,
  }),
};
FitMode.parameters = {
  docs: {
    description: {
      story:
        'With `fit-mode="fit"` the weight-based column width engine treats explicit `width` values as ' +
        "proportional hints and distributes all available table space across columns. " +
        "No filler gap appears on the right — columns always span 100% of the container width.",
    },
  },
};

/**
 * Demonstrates `fit-mode="gap"` (the default) — columns use their explicit px widths
 * and remaining space is left as a filler gap on the right side of the table.
 */

export const GapMode: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        fit-mode="gap" (default): columns use their explicit px widths; remaining space appears as a filler on the right.
      </p>
      <VcDataTable :items="products" fit-mode="gap">
        <VcColumn id="name" field="name" title="Name" width="180" />
        <VcColumn id="price" field="price" title="Price" type="money" width="110" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="90" />
        <VcColumn id="status" field="status" title="Status" width="120" />
        <VcColumn id="currency" field="currency" title="Currency" width="100" />
      </VcDataTable>
    </div>
  `,
  }),
};
GapMode.parameters = {
  docs: {
    description: {
      story:
        'With `fit-mode="gap"` (the default) columns are rendered at their explicit pixel widths. ' +
        "If the total column width is less than the table container width, the remaining space shows as a " +
        "filler area on the right. This is the classic spreadsheet-style layout.",
    },
  },
};

/**
 * Demonstrates `minWidth` and `maxWidth` constraints on VcColumn.
 * The engine respects the bounds even when redistributing widths in fit mode.
 */

export const MinMaxConstraints: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        "Name" has minWidth="200", "Stock" has maxWidth="100". Resize the browser to see constraints in action.
      </p>
      <VcDataTable :items="products" fit-mode="fit">
        <VcColumn id="name" field="name" title="Name (min 200px)" min-width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" width="130" />
        <VcColumn id="stock" field="stock" title="Stock (max 100px)" type="number" max-width="100" />
        <VcColumn id="status" field="status" title="Status" width="130" />
        <VcColumn id="currency" field="currency" title="Currency" width="100" />
      </VcDataTable>
    </div>
  `,
  }),
};
MinMaxConstraints.parameters = {
  docs: {
    description: {
      story:
        "VcColumn accepts `minWidth` and `maxWidth` props (number in px or CSS string). " +
        "The width engine clamps each column to its bounds after distributing space. " +
        'Here "Name" will never shrink below 200 px and "Stock" will never exceed 100 px, ' +
        "regardless of how remaining space is redistributed.",
    },
  },
};

/**
 * Demonstrates percentage-based column widths as initial sizing hints.
 * Four columns share 100% of the available width via percentage values.
 */

export const PercentageWidths: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        All four columns use percentage widths that sum to 100%. Try resizing to see proportional behaviour.
      </p>
      <VcDataTable :items="products" fit-mode="fit">
        <VcColumn id="name" field="name" title="Name (35%)" width="35%" />
        <VcColumn id="price" field="price" title="Price (25%)" type="money" width="25%" />
        <VcColumn id="stock" field="stock" title="Stock (20%)" type="number" width="20%" />
        <VcColumn id="status" field="status" title="Status (20%)" width="20%" />
      </VcDataTable>
    </div>
  `,
  }),
};
PercentageWidths.parameters = {
  docs: {
    description: {
      story:
        'Percentage strings (e.g. `width="35%"`) are resolved against the table container width ' +
        'and used as initial column sizes. Combined with `fit-mode="fit"` the percentages act as ' +
        "proportional weights, keeping the columns distributed across the full width as the container resizes.",
    },
  },
};

/**
 * Demonstrates a mix of px, percentage, and auto (undefined) width columns.
 * Shows how the three sizing strategies coexist in a single table.
 */

export const MixedWidths: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        "Name" = 200px, "Price" = 30%, "Stock" and "Status" have no explicit width (auto).
      </p>
      <VcDataTable :items="products" fit-mode="fit">
        <VcColumn id="name" field="name" title="Name (200px)" width="200" />
        <VcColumn id="price" field="price" title="Price (30%)" type="money" width="30%" />
        <VcColumn id="stock" field="stock" title="Stock (auto)" type="number" />
        <VcColumn id="status" field="status" title="Status (auto)" />
      </VcDataTable>
    </div>
  `,
  }),
};
MixedWidths.parameters = {
  docs: {
    description: {
      story:
        "All three column-width strategies can coexist in the same table: " +
        'a fixed pixel column (`width="200"`), a percentage column (`width="30%"`), ' +
        "and two auto columns without an explicit width. " +
        "The engine resolves px and % to concrete values first, then distributes the remaining " +
        "space equally among the auto columns.",
    },
  },
};

/**
 * Demonstrates crisis squeeze behaviour: 8 columns crammed into a 400 px container.
 * Columns shrink to their minimum widths to fit available space.
 */

export const NarrowContainer: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div>
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">
        8 columns inside a 400 px container — the engine squeezes columns toward their minimum widths.
      </p>
      <div style="width: 400px; border: 2px dashed #94a3b8; border-radius: 4px; overflow: hidden;">
        <VcDataTable :items="products" fit-mode="fit">
          <VcColumn id="id" field="id" title="ID" width="50" />
          <VcColumn id="name" field="name" title="Name" width="120" />
          <VcColumn id="price" field="price" title="Price" type="money" width="90" />
          <VcColumn id="currency" field="currency" title="Cur." width="55" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" width="65" />
          <VcColumn id="status" field="status" title="Status" width="90" />
          <VcColumn id="isActive" field="isActive" title="Active" type="status-icon" width="60" align="center" />
          <VcColumn id="createdAt" field="createdAt" title="Created" type="date" width="110" />
        </VcDataTable>
      </div>
    </div>
  `,
  }),
};
NarrowContainer.parameters = {
  docs: {
    description: {
      story:
        'When total column widths exceed the container size the engine enters "crisis squeeze" mode: ' +
        "it proportionally reduces column widths toward their `minWidth` limits until they fit. " +
        "Eight columns are defined with a total natural width far exceeding the 400 px container, " +
        "demonstrating how the engine handles overflow without a horizontal scrollbar.",
    },
  },
};

// ============================================================================
// URL Query State Persistence
// ============================================================================
