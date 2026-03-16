import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcIcon } from "@ui/components/atoms/vc-icon";

/**
 * # VcIcon Component
 *
 * The VcIcon component renders icons from multiple libraries.
 *
 * **Lucide Icons** are the standard — use the `lucide-` prefix (e.g. `lucide-home`).
 *
 * Legacy icon libraries (FontAwesome, Bootstrap, Material) are **deprecated** and will
 * emit console warnings in development. Migrate to Lucide equivalents.
 */
const meta = {
  title: "Atoms/VcIcon",
  component: VcIcon,
  parameters: {
    docs: {
      description: {
        component:
          "Unified icon component. **Standard: Lucide Icons** (`lucide-*` prefix). " +
          "Legacy support for FontAwesome (`fa-*`), Bootstrap (`bi-*`), Material (`material-*`), SVG sprites (`svg:`), " +
          "and direct Vue component instances. Legacy libraries are deprecated — migrate to Lucide.",
      },
    },
  },
  argTypes: {
    icon: {
      control: "text",
      description: "The icon to display. Use `lucide-{name}` format (e.g. `lucide-home`)",
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
      description: "[Deprecated] Whether to wrap the icon in a container for consistent spacing",
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
    icon: "lucide-home",
    size: "m",
    useContainer: false,
  },
} satisfies Meta<typeof VcIcon>;

export default meta;
type Story = StoryObj<typeof VcIcon>;

/**
 * Standard usage with Lucide icons — the recommended icon library.
 */
export const Basic: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Lucide Icons (Standard)</h1>

        <section class="tw-mb-8 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Common Icons</h2>
          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-home" size="xl" />
              <span class="tw-text-sm tw-mt-2">Home</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">lucide-home</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-settings" size="xl" />
              <span class="tw-text-sm tw-mt-2">Settings</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">lucide-settings</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-user" size="xl" />
              <span class="tw-text-sm tw-mt-2">User</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">lucide-user</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-shopping-cart" size="xl" />
              <span class="tw-text-sm tw-mt-2">Cart</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">lucide-shopping-cart</code>
            </div>
          </div>
        </section>

        <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h2 class="tw-text-xl tw-font-bold tw-mb-4 tw-border-b tw-pb-2">Status Variants</h2>
          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-star" size="xl" />
              <span class="tw-text-sm tw-mt-2">Default</span>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-circle-check" variant="success" size="xl" />
              <span class="tw-text-sm tw-mt-2">Success</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="success"</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-triangle-alert" variant="warning" size="xl" />
              <span class="tw-text-sm tw-mt-2">Warning</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">variant="warning"</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-bg-gray-50 tw-p-4 tw-rounded-lg">
              <VcIcon icon="lucide-circle-alert" variant="danger" size="xl" />
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
        story: "Standard usage with Lucide icons and status variants.",
      },
    },
  },
};

/**
 * All predefined sizes from xs (12px) to xxxl (64px).
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
              <VcIcon icon="lucide-star" size="xs" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xs</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">12px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="s" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">s</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">14px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="m" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">m (default)</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">18px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="l" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">l</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">20px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="xl" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xl</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">22px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="xxl" />
              <div class="tw-mt-2 tw-text-center">
                <span class="tw-text-sm tw-block">xxl</span>
                <span class="tw-text-xs tw-text-gray-500 tw-block">30px</span>
              </div>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" size="xxxl" />
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
            <VcIcon icon="lucide-star" :custom-size="48" />
            <div class="tw-mt-3 tw-text-center">
              <span class="tw-text-sm tw-block">Custom Size (48px)</span>
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-1">:custom-size="48"</code>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Seven predefined sizes (xs through xxxl) plus custom pixel sizes via `:custom-size`.",
      },
    },
  },
};

/**
 * Lucide Icons — the standard icon library.
 */
export const LucideIcons: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Lucide Icons (Standard)</h1>
        <p class="tw-mb-4 tw-text-gray-600">
          Lucide is the standard icon library. Use the prefix <code>lucide-</code> followed by the icon name.
          Browse all icons at <a href="https://lucide.dev/icons" class="tw-text-blue-600 tw-underline" target="_blank">lucide.dev/icons</a>.
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
        story: "Lucide is the standard icon library. Use `lucide-{name}` format.",
      },
    },
  },
};

/**
 * Deprecated legacy icon libraries. These still work but emit console warnings in development.
 * Open the browser console to see deprecation messages.
 */
export const LegacyDeprecated: Story = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Legacy Icons (Deprecated)</h1>

        <div class="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-4 tw-mb-6">
          <p class="tw-text-yellow-800">
            <strong>Deprecated:</strong> FontAwesome, Bootstrap, and Material icons are deprecated.
            They still render correctly but emit console warnings in development mode.
            Migrate to Lucide equivalents.
          </p>
        </div>

        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
          <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
            <h2 class="tw-text-lg tw-font-bold tw-mb-3">Bootstrap Icons</h2>
            <p class="tw-text-sm tw-text-gray-500 tw-mb-3">Prefix: <code>bi-</code></p>
            <div class="tw-flex tw-flex-col tw-gap-3">
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="bi-house" size="l" />
                <code class="tw-text-xs">bi-house</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-house</code>
              </div>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="bi-gear" size="l" />
                <code class="tw-text-xs">bi-gear</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-settings</code>
              </div>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="bi-person" size="l" />
                <code class="tw-text-xs">bi-person</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-user</code>
              </div>
            </div>
          </section>

          <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
            <h2 class="tw-text-lg tw-font-bold tw-mb-3">Font Awesome</h2>
            <p class="tw-text-sm tw-text-gray-500 tw-mb-3">Prefix: <code>fa-</code> or <code>fas fa-</code></p>
            <div class="tw-flex tw-flex-col tw-gap-3">
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="fa-home" size="l" />
                <code class="tw-text-xs">fa-home</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-home</code>
              </div>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="fa-user" size="l" />
                <code class="tw-text-xs">fa-user</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-user</code>
              </div>
            </div>
          </section>

          <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
            <h2 class="tw-text-lg tw-font-bold tw-mb-3">Material Icons</h2>
            <p class="tw-text-sm tw-text-gray-500 tw-mb-3">Prefix: <code>material-</code></p>
            <div class="tw-flex tw-flex-col tw-gap-3">
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-home" size="l" />
                <code class="tw-text-xs">material-home</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-home</code>
              </div>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-settings" size="l" />
                <code class="tw-text-xs">material-settings</code>
                <span class="tw-text-xs tw-text-gray-400">-></span>
                <code class="tw-text-xs tw-text-green-600">lucide-settings</code>
              </div>
            </div>
          </section>
        </div>

        <p class="tw-text-sm tw-text-gray-500 tw-mt-4 tw-text-center">
          Open the browser console to see deprecation warnings for each legacy icon above.
        </p>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Legacy icon libraries (FontAwesome, Bootstrap, Material) are **deprecated**. " +
          "They still render but emit `console.warn` in DEV mode. Open browser console to see the warnings. " +
          "Migrate to Lucide equivalents shown in green.",
      },
    },
  },
};

/**
 * Common e-commerce icons used throughout interfaces.
 */
export const EcommerceIcons: Story = {
  render: () => ({
    components: { VcIcon },
    setup() {
      const ecommerceIcons = [
        { icon: "lucide-shopping-cart", label: "Cart" },
        { icon: "lucide-circle-user-round", label: "Account" },
        { icon: "lucide-heart", label: "Wishlist" },
        { icon: "lucide-truck", label: "Shipping" },
        { icon: "lucide-package", label: "Products" },
        { icon: "lucide-search", label: "Search" },
        { icon: "lucide-credit-card", label: "Payment" },
        { icon: "lucide-receipt", label: "Orders" },
      ];
      return { icons: ecommerceIcons };
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
        story: "Common e-commerce icons: cart, account, wishlist, shipping, products, search, payment, and orders.",
      },
    },
  },
};

/**
 * Status icons with color variants for product/order states.
 */
export const StatusIcons: Story = {
  render: () => ({
    components: { VcIcon },
    setup() {
      const statusIcons = [
        { icon: "lucide-circle-check", variant: "success", label: "In Stock" },
        { icon: "lucide-triangle-alert", variant: "warning", label: "Low Stock" },
        { icon: "lucide-circle-x", variant: "danger", label: "Out of Stock" },
        { icon: "lucide-truck", variant: "success", label: "Shipped" },
        { icon: "lucide-clock", variant: "warning", label: "Processing" },
        { icon: "lucide-package", variant: undefined, label: "New Arrival" },
        { icon: "lucide-badge-check", variant: "success", label: "Verified" },
        { icon: "lucide-percent", variant: undefined, label: "On Sale" },
      ];
      return { icons: statusIcons };
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
        story: "Status icons with color variants for product availability and order state indication.",
      },
    },
  },
};

/**
 * All sizes comparison from xs to xxxl.
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
            <VcIcon :icon="args.icon || 'lucide-shopping-cart'" :size="size" />
            <span class="tw-text-xs">{{size}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Visual comparison of all seven predefined sizes.",
      },
    },
  },
};

/**
 * All color variants comparison.
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
            <VcIcon :icon="args.icon || 'lucide-truck'" :variant="variant" size="l" />
            <span class="tw-text-xs">{{variant || 'default'}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Color variants: default, warning, danger, and success.",
      },
    },
  },
};

/**
 * Direct CSS styling examples.
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
              <VcIcon icon="lucide-star" style="color: #3498db;" />
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">color: #3498db</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" style="color: #e74c3c;" />
              <code class="tw-text-xs tw-bg-gray-100 tw-p-1 tw-rounded tw-mt-2">color: #e74c3c</code>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcIcon icon="lucide-star" style="color: #2ecc71;" />
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
        story: "Icons can be styled with inline CSS for custom colors.",
      },
    },
  },
};
