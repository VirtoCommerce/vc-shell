import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
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

export const MobileUsers: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface User {
        id: number;
        name: string;
        email: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
      }
      const users: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "Admin",
          isActive: true,
          createdAt: new Date("2024-01-15"),
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Editor",
          isActive: true,
          createdAt: new Date("2024-02-20"),
        },
        {
          id: 3,
          name: "Bob Wilson",
          email: "bob@example.com",
          role: "Viewer",
          isActive: false,
          createdAt: new Date("2024-03-10"),
        },
        {
          id: 4,
          name: "Alice Brown",
          email: "alice@example.com",
          role: "Editor",
          isActive: true,
          createdAt: new Date("2024-04-05"),
        },
        {
          id: 5,
          name: "Charlie Davis",
          email: "charlie@example.com",
          role: "Admin",
          isActive: true,
          createdAt: new Date("2024-05-12"),
        },
      ];
      return { users };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Users List</strong>
        <span style="color: #64748b; font-size: 12px;"> (Universal mobile layout)</span>
      </div>
      <VcDataTable :items="users">
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="email" field="email" title="Email" mobile-role="field" />
        <VcColumn id="role" field="role" title="Role" mobile-role="field" />
        <VcColumn id="createdAt" field="createdAt" title="Joined" type="date-ago" mobile-role="field" />
        <VcColumn id="isActive" field="isActive" title="Status" type="status-icon" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileUsers.decorators = [withMobileView];
MobileUsers.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Universal mobile layout for Users data. Shows name as title, email/role/date as labeled fields, and status badge.",
    },
  },
};

/**
 * Mobile Card View - Documents/Pages (Universal Example)
 *
 * Minimal card layout for documents or pages - just title and metadata fields.
 * No image, no status - demonstrates flexibility.
 */

export const MobileDocuments: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface Document {
        id: number;
        title: string;
        author: string;
        category: string;
        lastModified: Date;
      }
      const documents: Document[] = [
        {
          id: 1,
          title: "Homepage Design Spec",
          author: "Jane Smith",
          category: "Design",
          lastModified: new Date("2025-01-28"),
        },
        {
          id: 2,
          title: "API Documentation",
          author: "John Doe",
          category: "Technical",
          lastModified: new Date("2025-01-25"),
        },
        {
          id: 3,
          title: "Marketing Strategy Q1",
          author: "Alice Brown",
          category: "Marketing",
          lastModified: new Date("2025-01-20"),
        },
        {
          id: 4,
          title: "User Research Report",
          author: "Bob Wilson",
          category: "Research",
          lastModified: new Date("2025-01-15"),
        },
        {
          id: 5,
          title: "Product Roadmap 2025",
          author: "Charlie Davis",
          category: "Planning",
          lastModified: new Date("2025-01-10"),
        },
      ];
      return { documents };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Documents</strong>
        <span style="color: #64748b; font-size: 12px;"> (Minimal card - no image/status)</span>
      </div>
      <VcDataTable :items="documents">
        <VcColumn id="title" field="title" title="Title" mobile-role="title" />
        <VcColumn id="author" field="author" title="Author" mobile-role="field" />
        <VcColumn id="category" field="category" title="Category" mobile-role="field" />
        <VcColumn id="lastModified" field="lastModified" title="Modified" type="date-ago" mobile-role="field" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileDocuments.decorators = [withMobileView];
MobileDocuments.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Minimal mobile layout for documents - title and labeled fields, no image or status. Shows layout flexibility.",
    },
  },
};

/**
 * Mobile Card View - Orders (Universal Example)
 *
 * E-commerce orders with order number, customer, total, and status.
 * Demonstrates multiple statuses (order status + payment status).
 */

export const MobileOrders: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface Order {
        id: number;
        orderNumber: string;
        customer: string;
        total: number;
        itemCount: number;
        status: string;
        paymentStatus: string;
        createdAt: Date;
      }
      const orders: Order[] = [
        {
          id: 1,
          orderNumber: "ORD-2025-001",
          customer: "John Doe",
          total: 299.99,
          itemCount: 3,
          status: "Shipped",
          paymentStatus: "Paid",
          createdAt: new Date("2025-01-28"),
        },
        {
          id: 2,
          orderNumber: "ORD-2025-002",
          customer: "Jane Smith",
          total: 149.5,
          itemCount: 2,
          status: "Processing",
          paymentStatus: "Paid",
          createdAt: new Date("2025-01-27"),
        },
        {
          id: 3,
          orderNumber: "ORD-2025-003",
          customer: "Bob Wilson",
          total: 599.0,
          itemCount: 5,
          status: "Pending",
          paymentStatus: "Pending",
          createdAt: new Date("2025-01-26"),
        },
        {
          id: 4,
          orderNumber: "ORD-2025-004",
          customer: "Alice Brown",
          total: 89.99,
          itemCount: 1,
          status: "Delivered",
          paymentStatus: "Paid",
          createdAt: new Date("2025-01-25"),
        },
        {
          id: 5,
          orderNumber: "ORD-2025-005",
          customer: "Charlie Davis",
          total: 1299.0,
          itemCount: 4,
          status: "Cancelled",
          paymentStatus: "Refunded",
          createdAt: new Date("2025-01-24"),
        },
      ];
      return { orders };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Orders</strong>
        <span style="color: #64748b; font-size: 12px;"> (Multiple statuses)</span>
      </div>
      <VcDataTable :items="orders">
        <VcColumn id="orderNumber" field="orderNumber" title="Order" mobile-role="title" />
        <VcColumn id="customer" field="customer" title="Customer" mobile-role="field" />
        <VcColumn id="total" field="total" title="Total" type="money" mobile-role="field" />
        <VcColumn id="itemCount" field="itemCount" title="Items" type="number" mobile-role="field" />
        <VcColumn id="createdAt" field="createdAt" title="Date" type="date-ago" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        <VcColumn id="paymentStatus" field="paymentStatus" title="Payment" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileOrders.decorators = [withMobileView];
MobileOrders.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "Orders with multiple status badges (order status + payment status). Only first 4 fields shown in grid.",
    },
  },
};

/**
 * Mobile Card View - Products with Multiple Statuses
 *
 * Demonstrates multiple status badges for a single row (status + isPublished).
 * Shows the full power of the universal layout.
 */

export const MobileProductsWithMultipleStatuses: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface ExtendedProduct extends Product {
        thumbnail: string;
        isPublished: boolean;
        gtin: string;
      }
      const products: ExtendedProduct[] = mockProducts.map((p, i) => ({
        ...p,
        thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
        isPublished: i % 2 === 0,
        gtin: `8901234567890${p.id}`,
      }));
      return { products };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Products (Extended)</strong>
        <span style="color: #64748b; font-size: 12px;"> (Image + Multiple Statuses)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="gtin" field="gtin" title="GTIN" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        <VcColumn id="isPublished" field="isPublished" title="Published" type="status-icon" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileProductsWithMultipleStatuses.decorators = [withMobileView];
MobileProductsWithMultipleStatuses.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "Products with image, title, 3 fields (Price, Stock, GTIN - only first 4 shown), and 2 status badges.",
    },
  },
};

/**
 * Mobile Card View - Legacy mobilePosition API (Backward Compatibility)
 *
 * The old `mobilePosition` API still works for backward compatibility.
 * First `top-left` becomes title, others become fields with labels.
 */

export const MobileLegacyAPI: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      return { products: mockProducts };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #fef3c7; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Legacy mobilePosition API</strong>
        <span style="color: #92400e; font-size: 12px;"> (Backward compatible)</span>
      </div>
      <VcDataTable :items="products">
        <!-- Using legacy mobilePosition instead of mobileRole -->
        <VcColumn id="name" field="name" title="Name" mobile-position="top-left" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-position="top-right" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-position="bottom-left" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-position="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileLegacyAPI.decorators = [withMobileView];
MobileLegacyAPI.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Legacy `mobilePosition` API for backward compatibility. First `top-left` becomes title, others become labeled fields.",
    },
  },
};

/**
 * Mobile Card View - Two Statuses Demo
 *
 * Demonstrates displaying multiple status badges in a single card.
 * Both statuses appear in a row at the bottom of the card.
 */

export const MobileTwoStatuses: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      interface ProductWithStatuses {
        id: number;
        name: string;
        price: number;
        stockStatus: string;
        publishStatus: string;
      }
      const products: ProductWithStatuses[] = [
        { id: 1, name: "Laptop Pro", price: 1299.99, stockStatus: "In Stock", publishStatus: "Published" },
        { id: 2, name: "Wireless Mouse", price: 49.99, stockStatus: "Low Stock", publishStatus: "Draft" },
        { id: 3, name: "USB-C Hub", price: 79.99, stockStatus: "Out of Stock", publishStatus: "Published" },
        { id: 4, name: "Mechanical Keyboard", price: 149.99, stockStatus: "In Stock", publishStatus: "Archived" },
        { id: 5, name: "Monitor Stand", price: 89.99, stockStatus: "In Stock", publishStatus: "Published" },
      ];
      return { products };
    },
    template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #ecfdf5; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Two Statuses Demo</strong>
        <span style="color: #065f46; font-size: 12px;"> (Stock + Publish status)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <!-- Two status columns - both will appear in bottom row -->
        <VcColumn id="stockStatus" field="stockStatus" title="Stock" type="status" mobile-role="status" />
        <VcColumn id="publishStatus" field="publishStatus" title="Publish" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileTwoStatuses.decorators = [withMobileView];
MobileTwoStatuses.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        'Two status badges displayed in a row at the bottom: Stock Status + Publish Status. Both use `mobile-role="status"`.',
    },
  },
};

/**
 * Mobile Pull-to-Refresh
 *
 * Demonstrates pull-to-refresh functionality on mobile view.
 * Pull down on the card list to trigger a refresh.
 * Uses spring physics animation for natural feel.
 */

export const MobilePullToRefresh: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const loading = ref(false);
      const refreshCount = ref(0);

      const handleRefresh = () => {
        loading.value = true;
        refreshCount.value++;
        // Simulate network request
        setTimeout(() => {
          // Simulate adding new item at the top
          const newProduct = {
            id: Date.now(),
            name: `New Product ${refreshCount.value}`,
            price: Math.floor(Math.random() * 200) + 50,
            stock: Math.floor(Math.random() * 100),
            status: "Active",
          };
          products.value = [newProduct, ...products.value.slice(0, 4)];
          loading.value = false;
        }, 1500);
      };

      return { products, loading, refreshCount, handleRefresh };
    },
    template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f0f9ff; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Pull-to-Refresh Demo</strong>
        <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
          ↓ Pull down to refresh (Refreshed {{ refreshCount }} times)
        </div>
      </div>
      <div style="height: 500px; overflow: hidden;">
        <VcDataTable
          :items="products"
          :loading="loading"
          :pull-to-refresh="true"
          @pull-refresh="handleRefresh"
        >
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
MobilePullToRefresh.decorators = [withMobileView];
MobilePullToRefresh.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Pull down on the card list to trigger refresh. Uses spring physics animation. Shows loading indicator while refreshing. New item is added to demonstrate data update.",
    },
  },
};

/**
 * Select All with Pagination
 *
 * Demonstrates the "Select All" API for tables with pagination.
 * When all visible items are selected and totalCount > items.length,
 * a banner appears allowing selection of ALL items including non-loaded ones.
 *
 * The parent component controls how to handle bulk operations when selectAllActive is true.
 */
