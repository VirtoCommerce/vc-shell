import type { Meta, StoryObj } from "@storybook/vue3";
import { VcIcon } from "./index";
import VcIconTest from "./vc-icon-test.vue";
import VcIconExamples from "./vc-icon-examples.vue";

/**
 * # VcIcon Component
 *
 * The VcIcon component is a versatile icon component supporting multiple icon libraries:
 * - Material Symbols
 * - Bootstrap Icons
 * - Lucide Icons
 * - Font Awesome
 * - Custom SVG Icons
 * - Custom Vue Components
 */
const meta = {
  title: "Atoms/VcIcon",
  component: VcIcon,
  parameters: {
    docs: {
      description: {
        component:
          "The VcIcon component provides unified access to multiple icon libraries including Material Symbols, Bootstrap Icons, Lucide Icons, Font Awesome, custom SVG icons, and Vue component icons.",
      },
    },
  },
  argTypes: {
    icon: {
      control: "text",
      description: "The icon to display. Can be a string identifier or a component instance",
    },
    size: {
      control: "select",
      options: ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
      description: "Predefined size of the icon",
    },
    variant: {
      control: "select",
      options: ["warning", "danger", "success"],
      description: "Color variant for status indication",
    },
    useContainer: {
      control: "boolean",
      description: "Whether to wrap the icon in a container for consistent spacing",
    },
    customSize: {
      control: "number",
      description: "Custom size in pixels (overrides size prop)",
    },
    basePath: {
      control: "text",
      description: "Base path for SVG icons (only for SVG icons)",
    },
  },
  args: {
    icon: "material-home",
    size: "m",
    useContainer: true,
  },
} satisfies Meta<typeof VcIcon>;

export default meta;
type Story = StoryObj<typeof VcIcon>;

/**
 * Default usage of the VcIcon component with different icon libraries
 */
export const Basic: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Basic Icon Usage</h1>

        <section class="tw-mb-8 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Icon Libraries</h2>
          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="material-home" size="xl" />
              <span class="tw-text-sm tw-mt-2">Material Icons</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">material-home</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="bi-house" size="xl" />
              <span class="tw-text-sm tw-mt-2">Bootstrap Icons</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">bi-house</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-home" size="xl" />
              <span class="tw-text-sm tw-mt-2">Lucide Icons</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">lucide-home</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="fas fa-home" size="xl" />
              <span class="tw-text-sm tw-mt-2">Font Awesome</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">fas fa-home</code>
            </div>
          </div>
        </section>

        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Status Variants</h2>
          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="material-star" size="xl" />
              <span class="tw-text-sm tw-mt-2">Default</span>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="material-check_circle" variant="success" size="xl" />
              <span class="tw-text-sm tw-mt-2">Success</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="success"</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="material-warning" variant="warning" size="xl" />
              <span class="tw-text-sm tw-mt-2">Warning</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="warning"</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="material-error" variant="danger" size="xl" />
              <span class="tw-text-sm tw-mt-2">Danger</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="danger"</code>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Basic usage of the VcIcon component with different icon libraries and status variants.",
      },
    },
  },
};

/**
 * Different icon sizes
 */
export const Sizes: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Icon Size Options</h1>

        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Predefined Sizes</h2>
          <div class="tw-flex tw-flex-wrap tw-items-end tw-justify-center tw-gap-8">
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="xs" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xs</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">12px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="s" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">s</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">14px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="m" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">m (default)</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">18px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="l" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">l</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">20px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="xl" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xl</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">22px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="xxl" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xxl</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">30px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" size="xxxl" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xxxl</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">64px</span>
              </div>
            </div>
          </div>
        </section>

        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm tw-mt-8">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Custom Size</h2>
          <div class="tw-flex tw-flex-col tw-items-center">
            <VcIcon icon="material-star" :custom-size="48" />
            <div class="tw-mt-3 tw-text-center">
              <span class="tw-text-sm tw-block">Custom Size (48px)</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">:custom-size="48"</code>
            </div>
          </div>
          <p class="tw-text-sm tw-text-gray-600 tw-text-center tw-mt-4">
            The custom-size prop allows you to specify any size in pixels
          </p>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "VcIcon comes with seven predefined sizes: xs, s, m, l, xl, xxl, and xxxl. You can also specify a custom size in pixels.",
      },
    },
  },
};

/**
 * Material Icons example with detailed options
 */
export const MaterialIcons: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Material Icons</h1>
        <p class="tw-mb-4 tw-text-gray-600">
          Material Icons are Google's official icon set following the Material Design guidelines.
          Use the prefix "material-" followed by the icon name.
        </p>

        <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-home" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">material-home</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-settings" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">material-settings</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-person" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">material-person</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-shopping_cart" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">material-shopping_cart</code>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Material Icons are Google's official icon set. Use the prefix 'material-' followed by the icon name.",
      },
    },
  },
};

/**
 * Bootstrap Icons example
 */
export const BootstrapIcons: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Bootstrap Icons</h1>
        <p class="tw-mb-4 tw-text-gray-600">
          Bootstrap Icons are free, high-quality, open source icons.
          Use the prefix "bi-" followed by the icon name.
        </p>

        <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="bi-house" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">bi-house</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="bi-gear" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">bi-gear</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="bi-person" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">bi-person</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="bi-cart" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">bi-cart</code>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Bootstrap Icons are free, high-quality icons. Use the prefix 'bi-' followed by the icon name.",
      },
    },
  },
};

/**
 * Lucide Icons example
 */
export const LucideIcons: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Lucide Icons</h1>
        <p class="tw-mb-4 tw-text-gray-600">
          Lucide is a community-developed icon library with clean, consistent design.
          Use the prefix "lucide-" followed by the icon name.
        </p>

        <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="lucide-home" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">lucide-home</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="lucide-settings" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">lucide-settings</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="lucide-user" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">lucide-user</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="lucide-shopping-cart" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">lucide-shopping-cart</code>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Lucide is a community-developed icon library with clean, consistent design. Use the prefix 'lucide-' followed by the icon name.",
      },
    },
  },
};

/**
 * Font Awesome Icons example
 */
export const FontAwesomeIcons: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Font Awesome Icons</h1>
        <p class="tw-mb-4 tw-text-gray-600">
          Font Awesome is a popular icon set with thousands of icons.
          Use the prefix "fas fa-" for solid icons, "far fa-" for regular icons, etc.
        </p>

        <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="fas fa-home" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">fas fa-home</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="fas fa-cog" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">fas fa-cog</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="fas fa-user" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">fas fa-user</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="fas fa-shopping-cart" size="xl" />
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">fas fa-shopping-cart</code>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Font Awesome is a popular icon set. Use the prefix 'fas fa-' for solid icons, 'far fa-' for regular icons, etc.",
      },
    },
  },
};

/**
 * Example of using a custom SVG component directly passed as a prop.
 */
export const CustomSvgIcon: Story = {
  args: {
    icon: "material-search",
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
    icon: "material-cancel",
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
        { icon: "material-cancel", variant: "danger", label: "Out of Stock" },
        { icon: "material-local_shipping", variant: "success", label: "Shipped" },
        { icon: "material-schedule", variant: "warning", label: "Processing" },
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
          <div v-for="item in icons" :key="item.icon" class="tw-flex tw-items-center tw-gap-2 tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-sm">
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

// Add a new story for CSS styling demonstration
export const WithCssStyled: Story = {
  name: "With External CSS Styles",
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto tw-space-y-8">
        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-border-b tw-pb-2">CSS vs. Preset Sizes</h3>
          <div class="tw-flex tw-justify-center tw-gap-8">
            <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="fas fa-star" size="xs" style="font-size: 30px;"/>
              <span class="tw-text-sm">size="xs" + container (30px)</span>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="fas fa-star" size="m" style="font-size: 30px;"/>
              <span class="tw-text-sm">size="m" + container (30px)</span>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="fas fa-star" size="xl" style="font-size: 30px;"/>
              <span class="tw-text-sm">size="xl" + container (30px)</span>
            </div>
          </div>
          <p class="tw-text-sm tw-text-gray-600 tw-text-center tw-mt-4">
            When both preset size and CSS font-size are used, CSS size takes precedence
          </p>
        </section>
      </div>
    `,
    data() {
      return {
        isHovered: false,
      };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Examples of styling icons with CSS. This demonstrates how icons can inherit font size from parent elements, have direct styling applied, and even dynamic styling with hover effects.",
      },
    },
  },
};

/**
 * Color variants for status indication
 */
export const ColorVariants: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-check_circle" size="xl" />
            <span class="tw-text-sm tw-mt-2">Default</span>
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">No variant</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-check_circle" variant="success" size="xl" />
            <span class="tw-text-sm tw-mt-2">Success</span>
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="success"</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-warning" variant="warning" size="xl" />
            <span class="tw-text-sm tw-mt-2">Warning</span>
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="warning"</code>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <VcIcon icon="material-error" variant="danger" size="xl" />
            <span class="tw-text-sm tw-mt-2">Danger</span>
            <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="danger"</code>
          </div>
        </div>

        <div class="tw-mt-6 tw-bg-blue-50 tw-p-4 tw-rounded-lg">
          <p class="tw-text-blue-800">
            <strong>Note:</strong> Color variants use CSS variables for theming. The values are defined in the root styles:
            <br />
            <code>--icon-color-success: var(--success-500)</code>
            <br />
            <code>--icon-color-danger: var(--danger-500)</code>
            <br />
            <code>--icon-color-warning: var(--warning-500)</code>
          </p>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The VcIcon component supports three color variants for status indication: success (green), warning (yellow), and danger (red).",
      },
    },
  },
};

/**
 * CSS styling example
 */
export const CssStyling: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Direct Styling</h2>
          <div class="tw-grid tw-grid-cols-3 tw-gap-4">
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" style="color: #3498db;" />
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">color: #3498db</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" style="color: #e74c3c;" />
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">color: #e74c3c</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="material-star" style="color: #2ecc71;" />
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">color: #2ecc71</code>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: " Icons can be styled with CSS.",
      },
    },
  },
};
