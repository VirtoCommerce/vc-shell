import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLineClamp: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const items = ref([
        {
          id: 1,
          title: "Short Title",
          description: "A short description.",
        },
        {
          id: 2,
          title: "Medium Length Title That Might Wrap",
          description:
            "This is a medium length description that might wrap to multiple lines depending on the column width.",
        },
        {
          id: 3,
          title: "Very Long Title That Will Definitely Need Multiple Lines to Display All the Text",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        },
      ]);

      return { items };
    },
    template: `
    <div class="tw-space-y-8">
      <div>
        <h3 class="tw-font-semibold tw-mb-2">Default (3 lines clamp)</h3>
        <div style="height: 200px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" />
            <VcColumn id="description" field="description" title="Description (default clamp)" />
          </VcDataTable>
        </div>
      </div>

      <div>
        <h3 class="tw-font-semibold tw-mb-2">Custom Line Clamp (1 line)</h3>
        <div style="height: 200px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" :line-clamp="1" />
            <VcColumn id="description" field="description" title="Description (1 line)" :line-clamp="1" />
          </VcDataTable>
        </div>
      </div>

      <div>
        <h3 class="tw-font-semibold tw-mb-2">No Line Clamp (lineClamp=0)</h3>
        <div style="height: 300px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" :line-clamp="0" />
            <VcColumn id="description" field="description" title="Description (no clamp)" :line-clamp="0" />
          </VcDataTable>
        </div>
      </div>
    </div>
  `,
  }),
};

// =============================================================================
// CELL TYPES - IMAGE, LINK, HTML, DATE-AGO
// =============================================================================

/**
 * Image Cell Type
 *
 * Demonstrates the `type="image"` column for displaying product images.
 */

export const CellTypeImage: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const items = ref([
        {
          id: 1,
          name: "Laptop Pro",
          image: "https://picsum.photos/seed/laptop/80/80",
          price: 1299.99,
        },
        {
          id: 2,
          name: "Wireless Mouse",
          image: "https://picsum.photos/seed/mouse/80/80",
          price: 49.99,
        },
        {
          id: 3,
          name: "USB-C Hub",
          image: "https://picsum.photos/seed/hub/80/80",
          price: 89.99,
        },
        {
          id: 4,
          name: 'Monitor 27"',
          image: "https://picsum.photos/seed/monitor/80/80",
          price: 399.99,
        },
        {
          id: 5,
          name: "Mechanical Keyboard",
          image: "", // Empty image to show placeholder
          price: 149.99,
        },
      ]);

      return { items };
    },
    template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Image Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="image"</code> to display images in cells. Empty/missing images show a placeholder.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="image" field="image" title="Image" type="image" width="100px" />
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * Link Cell Type
 *
 * Demonstrates the `type="link"` column for displaying clickable links.
 */

export const CellTypeLink: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const items = ref([
        {
          id: 1,
          name: "Vue.js Documentation",
          url: "https://vuejs.org/guide/introduction.html",
          category: "Documentation",
        },
        {
          id: 2,
          name: "TypeScript Handbook",
          url: "https://www.typescriptlang.org/docs/handbook/intro.html",
          category: "Documentation",
        },
        {
          id: 3,
          name: "Storybook",
          url: "https://storybook.js.org/",
          category: "Tools",
        },
        {
          id: 4,
          name: "Vite",
          url: "https://vitejs.dev/",
          category: "Build Tools",
        },
        {
          id: 5,
          name: "VcShell",
          url: "https://docs.virtocommerce.org/platform/developer-guide/2.0/custom-apps-development/vc-shell/Getting-started/creating-first-custom-app/",
          category: "UI Library",
        },
      ]);

      return { items };
    },
    template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Link Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="link"</code> to display clickable URLs. Links open in a new tab.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="name" field="name" title="Resource Name" />
        <VcColumn id="url" field="url" title="URL" type="link" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * HTML Cell Type
 *
 * Demonstrates the `type="html"` column for rendering rich HTML content.
 */

export const CellTypeHtml: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const items = ref([
        {
          id: 1,
          title: "Bold Text",
          content: "<strong>This text is bold</strong> and this is normal.",
        },
        {
          id: 2,
          title: "Colored Text",
          content:
            '<span style="color: green;">Green</span>, <span style="color: red;">Red</span>, <span style="color: blue;">Blue</span>',
        },
        {
          id: 3,
          title: "List",
          content: "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
        },
        {
          id: 4,
          title: "Mixed Content",
          content:
            '<em>Italic</em>, <u>underline</u>, and <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">code</code>',
        },
        {
          id: 5,
          title: "Badge Example",
          content:
            '<span style="display: inline-block; padding: 2px 8px; background: #10B981; color: white; border-radius: 12px; font-size: 12px;">Active</span>',
        },
      ]);

      return { items };
    },
    template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-warning-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">HTML Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="html"</code> to render raw HTML content. <strong>Warning:</strong> Only use with trusted data to avoid XSS vulnerabilities.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="title" field="title" title="Type" width="150px" />
        <VcColumn id="content" field="content" title="HTML Content" type="html" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * Date-Ago Cell Type
 *
 * Demonstrates the `type="date-ago"` column for displaying relative time (e.g., "2 hours ago").
 */

export const CellTypeDateAgo: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const now = new Date();
      const items = ref([
        {
          id: 1,
          action: "User logged in",
          timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
          user: "john.doe",
        },
        {
          id: 2,
          action: "Order placed",
          timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
          user: "jane.smith",
        },
        {
          id: 3,
          action: "Product updated",
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
          user: "admin",
        },
        {
          id: 4,
          action: "Comment added",
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          user: "support",
        },
        {
          id: 5,
          action: "Report generated",
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          user: "system",
        },
      ]);

      return { items };
    },
    template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Date-Ago Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="date-ago"</code> to display relative timestamps like "2 minutes ago", "3 hours ago", etc.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="action" field="action" title="Action" />
        <VcColumn id="user" field="user" title="User" width="150px" />
        <VcColumn id="timestamp" field="timestamp" title="When" type="date-ago" width="180px" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * All Cell Types Combined
 *
 * Demonstrates all available cell types in a single table.
 */

export const AllCellTypes: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const now = new Date();
      const items = ref([
        {
          id: 1,
          image: "https://picsum.photos/seed/p1/60/60",
          name: "Premium Laptop",
          description: "<strong>High-performance</strong> laptop with <em>16GB RAM</em>",
          price: 1299.99,
          currency: "USD",
          stock: 45,
          url: "https://example.com/laptop",
          isActive: true,
          status: "In Stock",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
        {
          id: 2,
          image: "https://picsum.photos/seed/p2/60/60",
          name: "Wireless Mouse",
          description: "<span style='color: gray;'>Ergonomic design</span> for comfort",
          price: 49.99,
          currency: "EUR",
          stock: 120,
          url: "https://example.com/mouse",
          isActive: true,
          status: "In Stock",
          createdAt: new Date("2024-02-10"),
          updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
        },
        {
          id: 3,
          image: "https://picsum.photos/seed/p3/60/60",
          name: "USB-C Hub",
          description: "<code>7-in-1</code> connectivity hub",
          price: 89.99,
          currency: "USD",
          stock: 0,
          url: "https://example.com/hub",
          isActive: false,
          status: "Out of Stock",
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      return { items };
    },
    template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">All Cell Types</p>
        <p class="tw-text-neutrals-600">This table demonstrates all available cell types: text, number, money, date, datetime, date-ago, image, link, html, status, and status-icon.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="image" field="image" title="Image" type="image" width="80px" />
        <VcColumn id="name" field="name" title="Name (text)" width="150px" />
        <VcColumn id="description" field="description" title="Description (html)" type="html" />
        <VcColumn id="price" field="price" title="Price (money)" type="money" currency-field="currency" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock (number)" type="number" width="100px" />
        <VcColumn id="url" field="url" title="URL (link)" type="link" width="180px" :line-clamp="1"/>
        <VcColumn id="isActive" field="isActive" title="Active" type="status-icon" width="80px" />
        <VcColumn id="status" field="status" title="Status" type="status" width="120px" />
        <VcColumn id="createdAt" field="createdAt" title="Created (date)" type="date" width="120px" />
        <VcColumn id="updatedAt" field="updatedAt" title="Updated (date-ago)" type="date-ago" width="140px" />
      </VcDataTable>
    </div>
  `,
  }),
};

// =============================================================================
// COLUMN SWITCHER
// =============================================================================

/**
 * Built-in Column Switcher — Auto Mode (via prop)
 *
 * Uses `column-switcher` (defaults to 'auto') to show declared VcColumns +
 * auto-discovered columns from item data keys. The switcher shows all possible
 * columns: declared ones start visible, data-derived ones start hidden.
 * Only 3 columns are declared — the remaining keys (id, currency, isActive, createdAt)
 * are auto-discovered and can be toggled on via the switcher.
 */
