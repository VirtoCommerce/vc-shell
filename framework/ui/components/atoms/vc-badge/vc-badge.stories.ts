import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcBadge from "@ui/components/atoms/vc-badge/vc-badge.vue";
import { ref } from "vue";

/**
 * `VcBadge` is a UI component used to display a small numerical or textual notification,
 * typically positioned relative to its container.
 * It's commonly used to show:
 *
 * - Unread notification counts
 * - Item counts in categories
 * - Status indicators (new, pending, completed)
 * - Alert indicators
 * - User activity status
 *
 * The component supports multiple variants, sizes, and states, making it adaptable to various use cases
 */
const meta = {
  title: "Atoms/VcBadge",
  component: VcBadge,
  tags: ["autodocs"],
  argTypes: {
    content: {
      description: "Text or numeric content to display inside the badge",
      control: "text",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "undefined" },
      },
    },
    active: {
      description: "Determines if the badge is in active state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Disables the badge, making it non-interactive",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clickable: {
      description: "Makes the badge respond to click events",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    size: {
      description: "Controls the size of the badge",
      control: "select",
      options: ["s", "m"],
      table: {
        type: { summary: "'s' | 'm'" },
        defaultValue: { summary: "'m'" },
        category: "Appearance",
      },
    },
    isDot: {
      description: "Displays the badge as a small dot without text content",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Appearance",
      },
    },
    variant: {
      description: "Specifies the color variant of the badge",
      control: "select",
      options: ["primary", "success", "warning", "danger", "info", "secondary"],
      table: {
        type: { summary: "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'" },
        defaultValue: { summary: "'primary'" },
        category: "Appearance",
      },
    },
    customPosition: {
      description: "Allows custom positioning of the badge using top and right props",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Layout",
      },
    },
    top: {
      description: "Custom top position when customPosition is true",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Layout",
      },
    },
    right: {
      description: "Custom right position when customPosition is true",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Layout",
      },
    },
    onClick: {
      action: "click",
      description: "Event emitted when clicking on a clickable badge",
      table: { category: "Events" },
    },
    default: {
      description: "Slot for content the badge will be attached to",
      table: { category: "Slots" },
    },
  },
  args: {
    content: "5",
    size: "m",
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        component: `
A versatile badge component for displaying counters, indicators, and notifications.

This component features multiple customization options through props, including:
- Different color variants to convey meaning (primary, success, warning, danger, info, secondary)
- Two size options (small and medium)
- State management (active, disabled, clickable)
- Display as either a counter with text/number or as a simple dot
- Custom positioning capabilities

## Usage

\`\`\`vue
<VcBadge content="5">
  <button>Notifications</button>
</VcBadge>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the VcBadge component, typically used to indicate a number of items in a cart or notifications.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup: () => ({ args }),
    template: `
      <div class="tw-flex tw-gap-4">
        <VcBadge v-bind="args">
          <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </VcBadge>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The default badge displays a count indicator. In e-commerce, this is commonly used for shopping carts, wishlists, and notifications.",
      },
    },
  },
};

/**
 * Various color variants of the badge for different use cases.
 */
export const Variants: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const variants = [
        { name: "primary", label: "Primary" },
        { name: "success", label: "Success" },
        { name: "warning", label: "Warning" },
        { name: "danger", label: "Danger" },
        { name: "info", label: "Info" },
        { name: "secondary", label: "Secondary" },
      ];
      return { variants, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-6">
        <div class="tw-flex tw-flex-wrap tw-gap-4">
          <div v-for="variant in variants" :key="variant.name" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcBadge
              :content="args.content"
              :variant="variant.name"
              :size="args.size"
            >
              <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </VcBadge>
            <span class="tw-text-xs">{{ variant.label }}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Different color variants can be used to communicate different states: error for issues, warning for attention, success for completed actions, etc.",
      },
    },
  },
};

/**
 * Badge as a dot indicator, often used to signify status or new content.
 */
export const DotIndicator: Story = {
  args: {
    isDot: true,
    content: undefined,
    variant: "primary",
  },
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const variants = ["primary", "success", "warning", "error", "info", "secondary"];
      return { variants, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-gap-4">
          <div v-for="variant in variants" :key="variant" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcBadge :isDot="true" :variant="variant">
              <div class="tw-w-5 tw-h-5 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </VcBadge>
            <span class="tw-text-xs">{{ variant }}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Dot indicators are useful for showing status information without a specific count. They're perfect for indicating new messages, activity status, or online presence.",
      },
    },
  },
};

/**
 * Showcasing both size variants of the badge.
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const sizes = [
        { size: "s", label: "Small" },
        { size: "m", label: "Medium" },
      ];
      return { sizes, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-gap-8">
          <div v-for="size in sizes" :key="size.size" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcBadge
              :content="args.content"
              :size="size.size"
              :variant="args.variant"
            >
              <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </VcBadge>
            <span class="tw-text-xs">{{ size.label }}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Choose the appropriate badge size based on the UI element it's attached to and the amount of information displayed.",
      },
    },
  },
};

/**
 * Interactive badge demo with a clickable badge.
 */
export const Clickable: Story = {
  args: {
    clickable: true,
    content: "8",
    variant: "primary",
  },
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const count = ref(Number(args.content) || 0);

      const handleClick = () => {
        count.value = Math.max(0, count.value - 1);
      };

      return { args, count, handleClick };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-gap-4 tw-items-center">
          <VcBadge
            :content="count"
            :clickable="args.clickable"
            :variant="args.variant"
            @click="handleClick"
          >
            <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </VcBadge>
          <p class="tw-text-sm">Click the badge to dismiss notifications</p>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Clickable badges allow users to interact with them, such as dismissing notifications or accessing related features. In this example, clicking the badge decrements the count.",
      },
    },
  },
};

/**
 * Demonstration of badges with varying content lengths.
 */
export const ContentVariations: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const examples = [
        { content: "1", label: "Single digit" },
        { content: "42", label: "Double digits" },
        { content: "99+", label: "Overflow" },
        { content: "New", label: "Text" },
        { content: "Sale!", label: "Long text" },
      ];
      return { examples, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-flex-wrap tw-gap-6">
          <div v-for="example in examples" :key="example.label" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcBadge
              :content="example.content"
              :variant="args.variant"
              :size="args.size"
            >
              <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-5 tw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </VcBadge>
            <span class="tw-text-xs">{{ example.label }}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Badges can display various types of content from single digits to text. The badge will automatically adjust its size to accommodate the content.",
      },
    },
  },
};

/**
 * E-commerce specific use cases for badges.
 */
export const UseCases: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup: () => {
      const examples = [
        { icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", content: "3", label: "Cart items", variant: "primary" },
        {
          icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
          content: "5",
          label: "Wishlist",
          variant: "error",
        },
        {
          icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
          content: "12",
          label: "Notifications",
          variant: "info",
        },
        {
          icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          content: "4",
          label: "Messages",
          variant: "primary",
        },
        {
          icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
          isDot: true,
          variant: "warning",
          label: "New item",
        },
        {
          icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          content: "Sale",
          label: "Discount",
          variant: "secondary",
        },
      ];
      return { examples, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-grid tw-grid-cols-3 tw-gap-6">
          <div v-for="example in examples" :key="example.label" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcBadge
              :content="example.content"
              :variant="example.variant"
              :isDot="example.isDot"
            >
              <div class="tw-w-8 tw-h-8 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="example.icon" />
                </svg>
              </div>
            </VcBadge>
            <span class="tw-text-xs">{{ example.label }}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Badges have many applications in e-commerce interfaces. This example showcases common use cases like cart item counts, notification indicators, and status badges for products.",
      },
    },
  },
};

/**
 * Example of custom positioning for badges.
 */
export const CustomPositioning: Story = {
  args: {
    customPosition: true,
    top: "-5px",
    right: "-5px",
    content: "New",
    variant: "success",
  },
  render: (args) => ({
    components: { VcBadge },
    setup: () => ({ args }),
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-gap-4">
          <VcBadge v-bind="args">
            <div class="tw-relative tw-w-24 tw-h-24 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
              <span class="tw-text-xs">Product</span>
            </div>
          </VcBadge>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Custom positioning allows you to place the badge exactly where you need it on the target element. This is useful for product cards with special indicators like 'New', 'Sale', or 'Featured'.",
      },
    },
  },
};
