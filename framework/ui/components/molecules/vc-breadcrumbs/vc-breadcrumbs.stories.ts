import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcBreadcrumbs } from "@ui/components/molecules/vc-breadcrumbs";
import { ref, watch, onMounted } from "vue";
// Import for example only - not needed in projects where useBreadcrumbs is already injected
import { useBreadcrumbs } from "@core/composables/useBreadcrumbs";

/**
 * `VcBreadcrumbs` is a component that displays a navigation path, helping users
 * understand their location within the application's hierarchy and navigate back.
 */
const meta = {
  title: "Molecules/VcBreadcrumbs",
  component: VcBreadcrumbs,
  tags: ["autodocs"],
  argTypes: {
    items: {
      description: "Array of breadcrumb items to display",
      control: "object",
      table: {
        type: { summary: "Breadcrumbs[]" },
        defaultValue: { summary: "[]" },
      },
    },
    variant: {
      description: "Visual style variant of the breadcrumbs",
      control: "select",
      options: ["default", "light"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    separated: {
      description: "Whether to show arrow separators between items",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    trigger: {
      description: "Custom template for the dropdown trigger button",
      table: {
        category: "slots",
        type: { summary: "{ click: () => void; isActive: boolean }" },
      },
    },
  },
  args: {
    items: [
      {
        id: "0",
        title: "Home",
        icon: "fas fa-home",
      },
      {
        id: "1",
        title: "Products",
      },
      {
        id: "2",
        title: "Electronics",
      },
    ],
    variant: "default",
    separated: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcBreadcrumbs component provides navigation hierarchy with these features:

- Adaptive display that automatically collapses items into a dropdown when space is limited
- Support for icon + text breadcrumb items
- Clickable items with custom click handlers
- Different visual styles (default and light variants)
- Optional separator arrows between items
- Customizable dropdown trigger via slot

## Usage

\`\`\`vue
<template>
  <vc-breadcrumbs :items="breadcrumbItems" @item-click="handleItemClick" />
</template>

<script setup lang="ts">
const breadcrumbItems = [
  { id: "home", title: "Home", icon: "fas fa-home" },
  { id: "products", title: "Products" },
  { id: "category", title: "Electronics" }
];

const handleItemClick = (itemId: string) => {
  // Navigate to the appropriate page
  console.log("Navigating to:", itemId);
};
</script>
\`\`\`

## Usage with useBreadcrumbs composable

For applications using the VC-Shell framework, it's recommended to use the \`useBreadcrumbs\` composable
for managing breadcrumb state:

\`\`\`vue
<template>
  <vc-breadcrumbs :items="breadcrumbs" />
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();

// Add a breadcrumb when navigating to a new page
push({
  id: "products",
  title: "Products",
  clickHandler: (id) => {
    // Navigate to the page and return true to update breadcrumbs
    router.push("/products");
    return true;
  }
});
</script>
\`\`\`
        `,
      },
    },
    actions: {
      handles: ["item-click"],
    },
  },
} satisfies Meta<typeof VcBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default breadcrumbs navigation
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      const handleItemClick = (itemId: string) => {
        console.log(`Clicked item with ID: ${itemId}`);
      };

      return { args, handleItemClick };
    },
    template: '<vc-breadcrumbs v-bind="args" @item-click="handleItemClick"></vc-breadcrumbs>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Standard breadcrumbs with default styling, showing basic navigation path.",
      },
    },
  },
};

/**
 * Breadcrumbs with arrow separators
 */
export const Separated: Story = {
  args: {
    separated: true,
  },
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      const handleItemClick = (itemId: string) => {
        console.log(`Clicked item with ID: ${itemId}`);
      };

      return { args, handleItemClick };
    },
    template: '<vc-breadcrumbs v-bind="args" @item-click="handleItemClick"></vc-breadcrumbs>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Breadcrumbs with arrow-style separators between items for clearer path visualization.",
      },
    },
  },
};

/**
 * Light variant with less visual weight
 */
export const LightVariant: Story = {
  args: {
    variant: "light",
  },
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      const handleItemClick = (itemId: string) => {
        console.log(`Clicked item with ID: ${itemId}`);
      };

      return { args, handleItemClick };
    },
    template: '<vc-breadcrumbs v-bind="args" @item-click="handleItemClick"></vc-breadcrumbs>',
  }),
  parameters: {
    docs: {
      description: {
        story: "A lighter visual style for when breadcrumbs need to be more subtle in the interface.",
      },
    },
  },
};

/**
 * Many items with automatic collapsing
 */
export const ManyItems: Story = {
  args: {
    items: [
      {
        id: "0",
        title: "Home",
        icon: "fas fa-home",
      },
      {
        id: "1",
        title: "Products",
      },
      {
        id: "2",
        title: "Electronics",
      },
      {
        id: "3",
        title: "Computers",
      },
      {
        id: "4",
        title: "Laptops",
      },
      {
        id: "5",
        title: "Gaming",
      },
      {
        id: "6",
        title: "ASUS ROG Strix G15",
      },
    ],
    separated: true,
  },
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      const handleItemClick = (itemId: string) => {
        console.log(`Clicked item with ID: ${itemId}`);
      };

      return { args, handleItemClick };
    },
    template: `
      <div style="max-width: 500px;">
        <p class="tw-text-sm tw-mb-2">Constrained width to demonstrate overflow behavior:</p>
        <vc-breadcrumbs v-bind="args" @item-click="handleItemClick"></vc-breadcrumbs>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how breadcrumbs handle many items by collapsing middle items into a dropdown menu to save space.",
      },
    },
  },
};

/**
 * Using the useBreadcrumbs composable
 *
 * This example demonstrates how to integrate the VcBreadcrumbs component with
 * the useBreadcrumbs composable from the VC-Shell framework for state management.
 */
export const WithUseBreadcrumbs: Story = {
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      // Initialize the useBreadcrumbs composable which provides:
      // - breadcrumbs: Computed array of breadcrumb items
      // - push: Method to add a breadcrumb to the trail
      // - remove: Method to remove breadcrumb(s) by ID
      const { breadcrumbs, push, remove } = useBreadcrumbs();
      const currentPage = ref("Home");

      // Define page type
      interface Page {
        id: string;
        title: string;
        icon: string;
      }

      const pages: Page[] = [
        { id: "home", title: "Home", icon: "fas fa-home" },
        { id: "products", title: "Products", icon: "fas fa-box" },
        { id: "categories", title: "Categories", icon: "fas fa-layer-group" },
        { id: "electronics", title: "Electronics", icon: "fas fa-laptop" },
        { id: "offers", title: "Special Offers", icon: "fas fa-tag" },
      ];

      // Function to simulate navigation and add a breadcrumb
      const navigateTo = (page: Page) => {
        currentPage.value = page.title;

        // Add to breadcrumbs with a click handler that enables navigation
        // The clickHandler is called when a user clicks on the breadcrumb
        // Return true to update the breadcrumb trail to this point
        push({
          id: page.id,
          title: page.title,
          icon: page.icon,
          clickHandler: (id) => {
            console.log(`Navigating back to ${page.title}`);
            currentPage.value = page.title;
            return true; // Returning true updates breadcrumbs to this point
          },
        });
      };

      // Initialize with home page
      onMounted(() => {
        navigateTo(pages[0]);
      });

      return {
        args,
        breadcrumbs,
        pages,
        currentPage,
        navigateTo,
        remove,
      };
    },
    template: `
      <div class="tw-space-y-6">
        <div class="tw-mb-4">
          <h3 class="tw-text-lg tw-font-medium tw-mb-2">Current page: {{ currentPage }}</h3>
          <!-- The breadcrumbs composable provides a reactive array for the items prop -->
          <vc-breadcrumbs
            :items="breadcrumbs"
            :variant="args.variant"
            :separated="true"
          ></vc-breadcrumbs>
        </div>

        <div class="tw-border-t tw-pt-4 tw-border-gray-200">
          <h4 class="tw-font-medium tw-mb-2">Navigation simulation:</h4>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <button
              v-for="page in pages"
              :key="page.id"
              class="tw-px-3 tw-py-1.5 tw-bg-blue-100 tw-rounded-md tw-text-blue-800 hover:tw-bg-blue-200"
              @click="navigateTo(page)"
            >
              Go to {{ page.title }}
            </button>
          </div>
        </div>

        <div class="tw-border-t tw-pt-4 tw-border-gray-200">
          <h4 class="tw-font-medium tw-mb-2">Breadcrumb management:</h4>
          <!-- The remove method can remove specific breadcrumbs by ID -->
          <button
            class="tw-px-3 tw-py-1.5 tw-bg-red-100 tw-rounded-md tw-text-red-800 hover:tw-bg-red-200"
            @click="remove(['products', 'categories'])"
          >
            Remove 'Products' and 'Categories' from breadcrumbs
          </button>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "This example demonstrates how to use the `useBreadcrumbs` composable from the VC-Shell framework. The composable provides a reactive breadcrumbs array that can be passed directly to the VcBreadcrumbs component. It also offers methods to add breadcrumbs when navigating (push), navigate back when clicking on a breadcrumb (via clickHandler), and remove specific breadcrumbs programmatically (remove).",
      },
    },
  },
};

/**
 * With click handlers for navigation
 */
export const WithClickHandlers: Story = {
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      // Create items with click handlers
      const items = [
        {
          id: "0",
          title: "Home",
          icon: "fas fa-home",
          clickHandler: (id: string) => {
            console.log(`Navigating to Home, id: ${id}`);
            alert(`Navigating to: Home`);
          },
        },
        {
          id: "1",
          title: "Products",
          clickHandler: (id: string) => {
            console.log(`Navigating to Products, id: ${id}`);
            alert(`Navigating to: Products`);
          },
        },
        {
          id: "2",
          title: "Electronics",
          clickHandler: (id: string) => {
            console.log(`Navigating to Electronics, id: ${id}`);
            alert(`Navigating to: Electronics`);
          },
        },
      ];

      return { items };
    },
    template: '<vc-breadcrumbs :items="items"></vc-breadcrumbs>',
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Shows breadcrumbs with custom click handlers per item, useful when each breadcrumb needs specific navigation behavior.",
      },
    },
  },
};

/**
 * With custom dropdown trigger
 */
export const WithCustomTrigger: Story = {
  args: {
    items: [
      {
        id: "0",
        title: "Home",
        icon: "fas fa-home",
      },
      {
        id: "1",
        title: "Products",
      },
      {
        id: "2",
        title: "Categories",
      },
      {
        id: "3",
        title: "Electronics",
      },
      {
        id: "4",
        title: "Computers",
      },
      {
        id: "5",
        title: "Laptops",
      },
    ],
    separated: true,
  },
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 450px;">
        <vc-breadcrumbs v-bind="args">
          <template #trigger="{ click, isActive }">
            <button
              class="tw-px-2 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded hover:tw-bg-blue-600 tw-transition"
              @click="click"
            >
              {{ isActive ? 'Close' : 'Show' }} options
            </button>
          </template>
        </vc-breadcrumbs>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates customizing the dropdown trigger button that appears when breadcrumbs collapse, allowing for consistent styling with your application.",
      },
    },
  },
};
