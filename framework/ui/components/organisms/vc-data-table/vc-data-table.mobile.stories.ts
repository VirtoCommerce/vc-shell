import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcButton } from "@ui/components/atoms";
import { withMobileView } from "../../../../../.storybook/decorators";
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

export const MobileViewInfo: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      // Extend products with thumbnail images
      interface ProductWithImage extends Product {
        thumbnail: string;
      }
      const products: ProductWithImage[] = mockProducts.map((p) => ({
        ...p,
        thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
      }));
      return { products };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Mobile View</strong>
        <span style="color: #64748b; font-size: 12px;"> (Real mobile layout with images)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileViewInfo.decorators = [withMobileView];
MobileViewInfo.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Real mobile card view with product images. Uses `withMobileView` decorator to activate mobile layout. Shows image on left, title at top, price/stock as labeled fields, and status badge at bottom.",
    },
  },
};

// ============================================================================
// MOBILE CARD VIEW STORIES
// ============================================================================

/**
 * Mobile Card View - New mobileRole API (Recommended)
 *
 * VcDataTable automatically switches to mobile card view on small screens.
 * Use `mobileRole` on VcColumn for semantic roles:
 *
 * - `title`: Primary identifier (full width, bold)
 * - `image`: Visual element (left side)
 * - `field`: Data with label (auto-distributed in 2x2 grid, max 4)
 * - `status`: Status badge (multiple allowed, bottom row)
 *
 * Fields are auto-placed in 2x2 grid (top-left, top-right, bottom-left, bottom-right).
 * Use `mobilePosition` to override auto-placement if needed.
 *
 * **Note:** View this story on a mobile viewport (375px) to see the mobile layout.
 */

export const MobileCardView: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Mobile View Preview</strong>
        <span style="color: #64748b; font-size: 12px;"> (New mobileRole API)</span>
      </div>
      <VcDataTable :items="products">
        <!-- Desktop only (no mobileRole) -->
        <VcColumn id="id" field="id" title="ID" />

        <!-- Mobile configured with mobileRole -->
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileCardView.decorators = [withMobileView];
MobileCardView.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Mobile card view using new `mobileRole` API. Title at top (bold), fields in 2-column grid with labels, status badges at bottom.",
    },
  },
};

/**
 * Mobile Card View with Swipe Actions
 *
 * Swipe left on a card to reveal row actions (iOS-style).
 * Shows up to 2 actions directly, with a "More" button for additional actions.
 */

export const MobileWithSwipeActions: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const eventLog = ref<string[]>([]);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-pencil",
          title: "Edit",
          type: "success" as const,
          clickHandler: () => {
            eventLog.value.unshift(`Edit: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-trash-2",
          title: "Delete",
          type: "danger" as const,
          clickHandler: () => {
            products.value = products.value.filter((p) => p.id !== item.id);
            eventLog.value.unshift(`Deleted: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
      ];

      return { products, eventLog, getRowActions };
    },
    template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Swipe Actions Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">← Swipe left on a card to reveal actions</div>
      </div>
      <div v-if="eventLog.length" style="background: #fef3c7; padding: 8px 12px; font-size: 12px;">
        <strong>Recent:</strong> {{ eventLog.join(' • ') }}
      </div>
      <div style="height: 500px;">
        <VcDataTable :items="products" :row-actions="getRowActions">
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
  }),
};
MobileWithSwipeActions.decorators = [withMobileView];
MobileWithSwipeActions.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "iOS-style swipe actions. Swipe left to reveal Edit and Delete buttons. Uses spring physics for natural feel.",
    },
  },
};

/**
 * Mobile Card View with Many Actions (Action Sheet)
 *
 * When there are more than 2 actions, a "More" button appears that opens
 * an iOS-style action sheet with all available actions.
 */

export const MobileWithManyActions: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const eventLog = ref<string[]>([]);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-eye",
          title: "View",
          clickHandler: () => {
            eventLog.value.unshift(`View: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-pencil",
          title: "Edit",
          type: "success" as const,
          clickHandler: () => {
            eventLog.value.unshift(`Edit: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-copy",
          title: "Duplicate",
          clickHandler: () => {
            eventLog.value.unshift(`Duplicate: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-archive",
          title: "Archive",
          type: "warning" as const,
          clickHandler: () => {
            eventLog.value.unshift(`Archive: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-trash-2",
          title: "Delete",
          type: "danger" as const,
          clickHandler: () => {
            products.value = products.value.filter((p) => p.id !== item.id);
            eventLog.value.unshift(`Deleted: ${item.name}`);
            if (eventLog.value.length > 3) eventLog.value.pop();
          },
        },
      ];

      return { products, eventLog, getRowActions };
    },
    template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Action Sheet Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Swipe → tap "More" to see action sheet</div>
      </div>
      <div v-if="eventLog.length" style="background: #fef3c7; padding: 8px 12px; font-size: 12px;">
        <strong>Recent:</strong> {{ eventLog.join(' • ') }}
      </div>
      <div style="height: 500px;">
        <VcDataTable :items="products" :row-actions="getRowActions">
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
  }),
};
MobileWithManyActions.decorators = [withMobileView];
MobileWithManyActions.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "With 5 actions, swipe shows 2 + 'More' button. Tap 'More' to open iOS-style action sheet.",
    },
  },
};

/**
 * Mobile Card View with Selection
 *
 * **How it works:**
 * 1. **Long-press** (hold ~500ms) on any card to start selection mode
 * 2. Once in selection mode, **checkboxes appear** on all cards
 * 3. Tap cards or checkboxes to toggle selection
 * 4. Click "Clear" button to exit selection mode
 *
 * This saves screen space by hiding checkboxes until selection is needed.
 */

export const MobileWithSelection: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn, VcButton },
    setup() {
      const selection = ref<Product[]>([]);
      const clearSelection = () => {
        selection.value = [];
      };
      return { products: mockProducts, selection, clearSelection };
    },
    template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Selection Demo</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              {{ selection.length > 0 ? selection.length + ' selected' : 'Long-press to select' }}
            </div>
          </div>
          <VcButton
            v-if="selection.length > 0"
            variant="outline"
            size="s"
            @click="clearSelection"
          >
            Clear
          </VcButton>
        </div>
      </div>
      <div style="height: 500px;">
        <VcDataTable
          :items="products"
          v-model:selection="selection"
          selection-mode="multiple"
        >
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
  }),
};
MobileWithSelection.decorators = [withMobileView];
MobileWithSelection.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Long-press (hold 500ms) on any card to activate selection mode. Checkboxes appear only when selection is active. Tap cards or checkboxes to toggle. Clear button exits selection mode.",
    },
  },
};

/**
 * Mobile Card View with All Cell Types
 *
 * Demonstrates various cell types in mobile card layout.
 */

export const MobileAllCellTypes: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface ExtendedProduct extends Product {
        thumbnail: string;
        description: string;
        lastUpdated: Date;
      }
      const products: ExtendedProduct[] = mockProducts.map((p) => ({
        ...p,
        thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
        description: `<strong>${p.name}</strong> - A great product for your needs.`,
        lastUpdated: new Date(),
      }));
      return { products };
    },
    template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Cell Types Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          Various data types rendered in mobile cards
        </div>
      </div>
      <div style="height: 600px;">
        <VcDataTable :items="products">
          <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="lastUpdated" field="lastUpdated" title="Updated" type="date-ago" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        </VcDataTable>
      </div>
    </div>
  `,
  }),
};
MobileAllCellTypes.decorators = [withMobileView];
MobileAllCellTypes.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Demonstrates image, money, date-ago, and number cell types in mobile card layout with new mobileRole API.",
    },
  },
};

// ============================================================================
// UNIVERSAL MOBILE CARD EXAMPLES
// ============================================================================

/**
 * Mobile Card View - Users (Universal Example)
 *
 * Demonstrates that mobile card layout works for ANY data type, not just products.
 * This example shows a user list with email, role, and active status.
 */
