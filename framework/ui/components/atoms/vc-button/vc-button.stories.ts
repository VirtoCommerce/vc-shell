import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcButton } from "./";
import { ref } from "vue";

const FILLED_VARIANTS = ["primary", "danger", "warning", "success", "info"] as const;
const STRUCTURAL_VARIANTS = ["secondary", "outline", "ghost", "link"] as const;
const ALL_VARIANTS = [...FILLED_VARIANTS, ...STRUCTURAL_VARIANTS] as const;
const ALL_SIZES = ["sm", "default", "lg"] as const;

/**
 * `VcButton` is a versatile UI component used for triggering actions when clicked.
 *
 * It supports 9 variants (5 filled + 4 structural), 4 sizes (sm, default, lg, icon),
 * loading state, accessible focus-visible rings, and keyboard navigation.
 *
 * **Design**: shadcn New York — clean borders, opacity-based hover, `focus-visible` ring,
 * `disabled:opacity-50`, rounded-md corners, compact h-9 default.
 */
const meta = {
  title: "Atoms/VcButton",
  component: VcButton,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Button content text",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "string" },
      },
    },
    icon: {
      description: "Icon to display inside the button (FontAwesome class name or component)",
      control: "text",
      table: {
        type: { summary: "string | Component" },
        defaultValue: { summary: "undefined" },
      },
    },
    iconClass: {
      description: "Additional CSS classes to apply to the icon",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    iconSize: {
      description: "Size of the icon",
      control: "select",
      options: ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
      table: {
        type: { summary: "'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'" },
        defaultValue: { summary: "'s'" },
      },
    },
    variant: {
      description: "Button style variant",
      control: "select",
      options: [...ALL_VARIANTS],
      table: {
        type: {
          summary:
            "'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'outline' | 'ghost' | 'link'",
        },
        defaultValue: { summary: "'primary'" },
      },
    },
    size: {
      description: "Button size (shadcn New York convention). Legacy 'xs' maps to 'sm', 'base' maps to 'default'.",
      control: "select",
      options: ["sm", "default", "lg", "icon"],
      table: {
        type: { summary: "'sm' | 'default' | 'lg' | 'icon'" },
        defaultValue: { summary: "'default'" },
      },
    },
    type: {
      description: "HTML button type attribute",
      control: "select",
      options: ["button", "submit", "reset"],
      table: {
        type: { summary: "'button' | 'submit' | 'reset'" },
        defaultValue: { summary: "'button'" },
      },
    },
    disabled: {
      description: "Whether the button is disabled",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    loading: {
      description: "Whether the button shows a loading spinner",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      description: "Whether the button appears selected/active",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    text: {
      description: "Whether the button should appear as text only (no background). Legacy — use variant='ghost' for new code.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    ariaLabel: {
      description: "Accessible label for icon-only buttons",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    onClick: {
      description: "Event emitted when the button is clicked",
      action: "clicked",
      table: {
        category: "Events",
        type: { summary: "(event: 'click', value: Event) => void" },
      },
    },
  },
  args: {
    default: "Button Text",
    variant: "primary",
    size: "default",
    iconSize: "s",
  },
} satisfies Meta<typeof VcButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Individual variant stories --

export const Primary: Story = {
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Secondary: Story = {
  args: { variant: "secondary" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Danger: Story = {
  args: { variant: "danger" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Warning: Story = {
  args: { variant: "warning" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Success: Story = {
  args: { variant: "success" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Info: Story = {
  args: { variant: "info" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Outline: Story = {
  args: { variant: "outline" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Ghost: Story = {
  args: { variant: "ghost" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

export const Link: Story = {
  args: { variant: "link" },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args">{{ args.default }}</VcButton>',
  }),
};

// -- Gallery stories --

/**
 * All 9 variants side by side — the most important story for visual review.
 */
export const AllVariants: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <VcButton variant="primary">Primary</VcButton>
        <VcButton variant="secondary">Secondary</VcButton>
        <VcButton variant="danger">Danger</VcButton>
        <VcButton variant="warning">Warning</VcButton>
        <VcButton variant="success">Success</VcButton>
        <VcButton variant="info">Info</VcButton>
        <VcButton variant="outline">Outline</VcButton>
        <VcButton variant="ghost">Ghost</VcButton>
        <VcButton variant="link">Link</VcButton>
      </div>
    `,
  }),
};

/**
 * All sizes (sm, default, lg) for each variant + icon size demo.
 */
export const AllSizes: Story = {
  render: () => ({
    components: { VcButton },
    setup: () => ({ variants: [...ALL_VARIANTS], sizes: [...ALL_SIZES] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: 12px; align-items: center;">
          <span style="width: 80px; font-size: 12px; color: #666;">{{ variant }}</span>
          <VcButton :variant="variant" size="sm">Small</VcButton>
          <VcButton :variant="variant" size="default">Default</VcButton>
          <VcButton :variant="variant" size="lg">Large</VcButton>
          <VcButton :variant="variant" size="icon" icon="lucide-plus" aria-label="Add" />
        </div>
      </div>
    `,
  }),
};

// -- State stories --

/**
 * Loading state with spinner — content stays invisible to preserve width.
 */
export const Loading: Story = {
  render: () => ({
    components: { VcButton },
    setup() {
      const loading = ref(false);
      const handleClick = () => {
        loading.value = true;
        setTimeout(() => { loading.value = false; }, 2000);
      };
      return { loading, handleClick };
    },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" :loading="loading" @click="handleClick">Click to Load</VcButton>
        <VcButton variant="secondary" loading>Loading...</VcButton>
        <VcButton variant="danger" loading>Deleting</VcButton>
        <VcButton variant="success" loading icon="lucide-check">Saving</VcButton>
      </div>
    `,
  }),
};

/**
 * All variants in disabled state — uniform opacity-50 treatment.
 */
export const Disabled: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <VcButton variant="primary" disabled>Primary</VcButton>
        <VcButton variant="secondary" disabled>Secondary</VcButton>
        <VcButton variant="danger" disabled>Danger</VcButton>
        <VcButton variant="warning" disabled>Warning</VcButton>
        <VcButton variant="success" disabled>Success</VcButton>
        <VcButton variant="info" disabled>Info</VcButton>
        <VcButton variant="outline" disabled>Outline</VcButton>
        <VcButton variant="ghost" disabled>Ghost</VcButton>
        <VcButton variant="link" disabled>Link</VcButton>
      </div>
    `,
  }),
};

// -- Icon stories --

/**
 * Button with an icon and text.
 */
export const WithIcon: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" icon="lucide-plus">Add Item</VcButton>
        <VcButton variant="secondary" icon="lucide-download">Export</VcButton>
        <VcButton variant="danger" icon="lucide-trash-2">Delete</VcButton>
        <VcButton variant="outline" icon="lucide-settings">Settings</VcButton>
      </div>
    `,
  }),
};

/**
 * Icon-only buttons using the `icon` size — perfect square (36x36).
 */
export const IconOnly: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" size="icon" icon="lucide-plus" aria-label="Add" />
        <VcButton variant="secondary" size="icon" icon="lucide-search" aria-label="Search" />
        <VcButton variant="ghost" size="icon" icon="lucide-more-vertical" aria-label="More" />
        <VcButton variant="outline" size="icon" icon="lucide-x" aria-label="Close" />
      </div>
    `,
  }),
};

/**
 * Icon-only button with aria-label for screen readers.
 */
export const IconOnlyWithAriaLabel: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" size="icon" icon="lucide-plus" aria-label="Add new item" />
        <VcButton variant="danger" size="icon" icon="lucide-trash-2" aria-label="Delete item" />
        <VcButton variant="ghost" size="icon" icon="lucide-more-vertical" aria-label="More options" />
      </div>
    `,
  }),
};

// -- Selected state --

/**
 * Selected/active button state across variants.
 */
export const Selected: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" selected>Primary</VcButton>
        <VcButton variant="secondary" selected>Secondary</VcButton>
        <VcButton variant="outline" selected>Outline</VcButton>
      </div>
    `,
  }),
};

// -- Backward compatibility --

/**
 * Legacy `text` prop — renders as ghost-like transparent button.
 * Consumers don't need to change code: this still works.
 */
export const TextLegacy: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <VcButton variant="primary" text>Primary Text</VcButton>
        <VcButton variant="secondary" text>Secondary Text</VcButton>
      </div>
    `,
  }),
};

/**
 * Legacy size aliases — `base` maps to `default`, `xs` maps to `sm`.
 * Existing code using old names still works identically.
 */
export const LegacySizeAliases: Story = {
  render: () => ({
    components: { VcButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="width: 120px; font-size: 12px; color: #666;">size="xs" (→ sm)</span>
          <VcButton size="xs">Legacy XS</VcButton>
          <VcButton size="sm">New SM</VcButton>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="width: 120px; font-size: 12px; color: #666;">size="base" (→ default)</span>
          <VcButton size="base">Legacy Base</VcButton>
          <VcButton size="default">New Default</VcButton>
        </div>
      </div>
    `,
  }),
};
