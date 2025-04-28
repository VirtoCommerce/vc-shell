import type { Meta, StoryObj } from "@storybook/vue3";
import { VcIcon } from ".";
import { SearchIcon, ChevronRightIcon, PlusSignIcon } from "./icons";
import VcIconTest from "./vc-icon-test.vue";
import VcIconExamples from "./vc-icon-examples.vue";

/**
 * `VcIcon` is a versatile icon component that supports multiple icon types:
 * - Font Awesome icons
 * - Custom SVG components
 * - Material Design icons
 * - Bootstrap icons
 * - Lucide icons
 *
 * It handles different sizing, color variants, and customization options for each icon library.
 */
const meta = {
  title: "Atoms/VcIcon",
  component: VcIcon,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "text",
      description:
        "Icon to display. Can be a Font Awesome icon (e.g., 'fas fa-home'), Bootstrap icon (e.g., 'bi-house'), Material icon (e.g., 'material-home'), Lucide icon (e.g., 'lucide-home') or custom component",
      table: {
        type: { summary: "string | Component" },
        defaultValue: { summary: "'fas fa-square-full'" },
      },
    },
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
      description: "Size of the icon",
      table: {
        type: { summary: "'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'" },
        defaultValue: { summary: "'m'" },
        category: "Appearance",
      },
    },
    variant: {
      control: { type: "select" },
      options: [undefined, "warning", "danger", "success"],
      description: "Color variant of the icon",
      table: {
        type: { summary: "'warning' | 'danger' | 'success'" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    useContainer: {
      control: { type: "boolean" },
      description: "Whether to wrap the icon in a container for consistent spacing",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Layout",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcIcon component is designed to handle various icon types with a unified interface:

- **Font Awesome icons**: Use class names like "fas fa-home"
- **Bootstrap icons**: Use class names like "bi-house"
- **Material Design icons**: Use prefixed names like "material-home"
- **Lucide icons**: Use prefixed names like "lucide-home" or direct component imports
- **Custom SVG components**: Pass components directly or reference by name

The component automatically detects the icon type and renders it accordingly.
        `,
      },
    },
  },
} satisfies Meta<typeof VcIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic example of using Font Awesome icons.
 * These icons require the Font Awesome library to be loaded in your project.
 */
export const FontAwesome: Story = {
  args: {
    icon: "fas fa-shopping-cart",
    size: "l",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Font Awesome icons are rendered as `<i>` elements with the provided class names. This shopping cart icon is commonly used in e-commerce applications.",
      },
    },
  },
};

/**
 * Example of using a custom SVG component directly passed as a prop.
 */
export const CustomSvgIcon: Story = {
  args: {
    icon: SearchIcon,
    size: "l",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom SVG components can be imported and passed directly to the `icon` prop. Search functionality is essential for product discovery in e-commerce.",
      },
    },
  },
};

/**
 * Example of using Material Design icon with outlined style.
 */
export const MaterialOutlined: Story = {
  args: {
    icon: "material-shopping_bag",
    size: "l",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Material Design icons with 'outlined' style have hollow interiors. The shopping bag icon is commonly used for orders and purchases in e-commerce applications.",
      },
    },
  },
};

/**
 * Example of Bootstrap Icon usage.
 */
export const BootstrapIcon: Story = {
  args: {
    icon: "bi-cart",
    size: "l",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Bootstrap icons can be used with the 'bi-' prefix. The cart icon is universal in e-commerce interfaces.",
      },
    },
  },
};

/**
 * Example of Lucide Icon usage.
 */
export const LucideIcon: Story = {
  args: {
    icon: "lucide-shopping-bag",
    size: "l",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Lucide icons can be used with the 'lucide-' prefix. These modern icons work well in clean e-commerce designs.",
      },
    },
  },
};

/**
 * Example of an icon with the success variant.
 */
export const VariantSuccess: Story = {
  args: {
    icon: "material-check_circle",
    size: "l",
    variant: "success",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The success variant applies a success/confirmation color to the icon. Useful for confirming completed orders or successful payments.",
      },
    },
  },
};

/**
 * Example of an icon with the warning variant.
 */
export const VariantWarning: Story = {
  args: {
    icon: "material-error_outline",
    size: "l",
    variant: "warning",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The warning variant applies a warning color to the icon. Use for indicating low stock or potential issues with orders.",
      },
    },
  },
};

/**
 * Example of an icon with the danger variant.
 */
export const VariantDanger: Story = {
  args: {
    icon: "material-highlight_off",
    size: "l",
    variant: "danger",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The danger variant applies an error/danger color to the icon. Useful for error states or cancellation actions in the checkout process.",
      },
    },
  },
};

/**
 * Example showing all sizes of the same icon.
 */
export const AllSizes: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl"];
      return { sizes, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Available Sizes</h3>
        <div class="tw-flex tw-items-end tw-gap-6">
          <div v-for="size in sizes" :key="size" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon :icon="args.icon || 'material-shopping_cart'" :size="size" />
            <span class="tw-text-xs">{{size}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Comparison of all available icon sizes from xs to xxxl. Choose the appropriate size based on where the icon appears in your interface.",
      },
    },
  },
};

/**
 * Example showing all variants of the same icon.
 */
export const AllVariants: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      const variants = [undefined, "warning", "danger", "success"];
      return { variants, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Available Variants</h3>
        <div class="tw-flex tw-gap-6">
          <div v-for="(variant, index) in variants" :key="index" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon :icon="args.icon || 'material-local_shipping'" :variant="variant" size="l" />
            <span class="tw-text-xs">{{variant || 'default'}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Comparison of all available color variants: default, warning, danger, and success. The shipping icon demonstrates how status variations can indicate different delivery states.",
      },
    },
  },
};

/**
 * Common e-commerce icons used throughout interfaces.
 */
export const EcommerceIcons: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      const ecommerceIcons = [
        { icon: "material-shopping_cart", label: "Cart" },
        { icon: "material-account_circle", label: "Account" },
        { icon: "material-favorite", label: "Wishlist" },
        { icon: "material-local_shipping", label: "Shipping" },
        { icon: "material-inventory", label: "Products" },
        { icon: "material-search", label: "Search" },
        { icon: "material-payments", label: "Payment" },
        { icon: "material-receipt_long", label: "Orders" },
      ];
      return { icons: ecommerceIcons, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Common E-commerce Icons</h3>
        <div class="tw-grid tw-grid-cols-4 tw-gap-4">
          <div v-for="item in icons" :key="item.icon" class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-p-4 tw-border tw-border-gray-200 tw-rounded">
            <VcIcon :icon="item.icon" size="xl" />
            <span class="tw-text-sm">{{item.label}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "A collection of commonly used icons in e-commerce interfaces. These represent core functionality like cart, account, wishlist, shipping, products, search, payment, and orders.",
      },
    },
  },
};

/**
 * Interactive state icons used to indicate product or order status.
 */
export const StatusIcons: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      const statusIcons = [
        { icon: "material-check_circle", variant: "success", label: "In Stock" },
        { icon: "material-error_outline", variant: "warning", label: "Low Stock" },
        { icon: "material-highlight_off", variant: "danger", label: "Out of Stock" },
        { icon: "material-local_shipping", variant: "success", label: "Shipped" },
        { icon: "material-access_time", variant: "warning", label: "Processing" },
        { icon: "material-inventory_2", variant: undefined, label: "New Arrival" },
        { icon: "material-verified", variant: "success", label: "Verified" },
        { icon: "material-percent", variant: undefined, label: "On Sale" },
      ];
      return { icons: statusIcons, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Product & Order Status Icons</h3>
        <div class="tw-grid tw-grid-cols-4 tw-gap-4">
          <div v-for="item in icons" :key="item.icon" class="tw-flex tw-items-center tw-gap-2 tw-p-4 tw-border tw-border-gray-200 tw-rounded">
            <VcIcon :icon="item.icon" :variant="item.variant" size="l" />
            <span class="tw-text-sm">{{item.label}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Status icons with appropriate color variants to indicate product availability, order status, and other state information in e-commerce applications.",
      },
    },
  },
};

export const IconTest: Story = {
  render: () => ({
    components: { VcIcon, VcIconTest },
    template: `
      <VcIconTest />
    `,
  }),
};

export const IconExamples: Story = {
  render: () => ({
    components: { VcIcon, VcIconExamples },
    template: `
      <VcIconExamples />
    `,
  }),
};
