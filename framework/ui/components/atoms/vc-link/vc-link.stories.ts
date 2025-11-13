import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcLink } from "./";

/**
 * `VcLink` - component for displaying clickable links with various states
 */
const meta = {
  title: "Atoms/VcLink",
  component: VcLink,
  tags: ["autodocs"],
  args: {
    active: false,
    disabled: false,
    default: "This is a link",
  },
  argTypes: {
    default: {
      description: "Link text content",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    active: {
      description: "Set link to active state",
      control: "boolean",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Disable the link",
      control: "boolean",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onClick: {
      description: "Function to call when link is clicked",
      table: {
        category: "Props",
        type: { summary: "function" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcLink component provides a clickable link element:

- Supports active and disabled states
- Changes styling on hover
- Can be used for navigation or action triggers
- Uses the primary color scheme by default
        `,
      },
    },
    actions: {
      handles: ["click"],
    },
  },
} satisfies Meta<typeof VcLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default link example
 */
export const Default: Story = {
  args: {
    default: "Click me",
  },
  render: (args) => ({
    components: { VcLink },
    setup() {
      return { args };
    },
    template: '<vc-link v-bind="args" @click="() => console.log(\'Link clicked\')">{{args.default}}</vc-link>',
  }),
};

/**
 * Link in active state
 */
export const Active: Story = {
  args: {
    default: "Active link",
    active: true,
  },
  render: (args) => ({
    components: { VcLink },
    setup() {
      return { args };
    },
    template: '<vc-link v-bind="args">{{args.default}}</vc-link>',
  }),
};

/**
 * Disabled link that cannot be clicked
 */
export const Disabled: Story = {
  args: {
    default: "Disabled link",
    disabled: true,
  },
  render: (args) => ({
    components: { VcLink },
    setup() {
      return { args };
    },
    template: '<vc-link v-bind="args">{{args.default}}</vc-link>',
  }),
};

/**
 * Link with longer text content
 */
export const LongText: Story = {
  args: {
    default: "This is a much longer link text that might wrap to multiple lines depending on the container width",
  },
  render: (args) => ({
    components: { VcLink },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 300px;"><vc-link v-bind="args">{{args.default}}</vc-link></div>',
  }),
};

/**
 * Multiple links in a navigation context
 */
export const NavigationExample: Story = {
  render: () => ({
    components: { VcLink },
    template: `
      <div class="tw-flex tw-gap-4">
        <vc-link :active="true">Home</vc-link>
        <vc-link>Products</vc-link>
        <vc-link>Services</vc-link>
        <vc-link :disabled="true">Admin</vc-link>
      </div>
    `,
  }),
};
