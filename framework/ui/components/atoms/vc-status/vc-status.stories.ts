import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcStatus } from "./";
import { VcIcon } from "../vc-icon";

/**
 * `VcStatus` is a component for displaying status indicators with different visual styles.
 * It's used to represent the state of items or processes in the application.
 */
const meta = {
  title: "Atoms/VcStatus",
  component: VcStatus,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      description: "Visual style of the status indicator",
      control: "select",
      options: ["info", "warning", "danger", "success", "light-danger", "info-dark", "primary"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "info" },
      },
    },
    outline: {
      description: "DEPRECATED: Whether to show only the outline of the status indicator",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    extend: {
      description: "Whether to use an extended layout with more padding and square corners",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    dot: {
      description: "Whether to display only a colored dot without text",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    default: {
      description: "Text content of the status indicator",
      control: "text",
      table: {
        category: "slots",
        type: { summary: "VNode | string" },
      },
    },
  },
  args: {
    variant: "info",
    outline: false,
    extend: false,
    dot: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcStatus component provides visual status indicators with these features:

- Multiple color variants (info, warning, danger, success, etc.)
- Support for compact (dot) display mode
- Extended layout for more detailed status information
- Can contain text or complex content through default slot
        `,
      },
    },
  },
} satisfies Meta<typeof VcStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default status indicator
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: '<vc-status v-bind="args">Status text</vc-status>',
  }),
};

/**
 * Success status variant
 */
export const Success: Story = {
  args: {
    variant: "success",
  },
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: '<vc-status v-bind="args">Success</vc-status>',
  }),
};

/**
 * Warning status variant
 */
export const Warning: Story = {
  args: {
    variant: "warning",
  },
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: '<vc-status v-bind="args">Warning</vc-status>',
  }),
};

/**
 * Danger status variant
 */
export const Danger: Story = {
  args: {
    variant: "danger",
  },
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: '<vc-status v-bind="args">Error</vc-status>',
  }),
};

/**
 * Dot-only display mode
 */
export const DotOnly: Story = {
  args: {
    dot: true,
  },
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-space-x-2">
        <vc-status v-bind="args" variant="info"></vc-status>
        <vc-status v-bind="args" variant="success"></vc-status>
        <vc-status v-bind="args" variant="warning"></vc-status>
        <vc-status v-bind="args" variant="danger"></vc-status>
        <vc-status v-bind="args" variant="primary"></vc-status>
      </div>
    `,
  }),
};

/**
 * Extended status with rich content
 */
export const Extended: Story = {
  args: {
    extend: true,
    variant: "danger",
  },
  render: (args) => ({
    components: { VcStatus, VcIcon },
    setup() {
      return { args };
    },
    template: `
      <vc-status v-bind="args">
        <div class="tw-flex tw-flex-row tw-items-center">
          <VcIcon icon="material-warning" size="xl" variant="danger" class="tw-mr-3" />
          <div>
            <h3 class="tw-font-bold">Error Status</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque tortor id lacus viverra, ut mollis libero auctor.</p>
          </div>
        </div>
      </vc-status>
    `,
  }),
};

/**
 * Primary variant with info-dark for contrast
 */
export const SpecialVariants: Story = {
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-space-y-2">
        <vc-status variant="primary">Primary Status</vc-status>
        <vc-status variant="info-dark">Info Dark Status</vc-status>
        <vc-status variant="light-danger">Light Danger Status</vc-status>
      </div>
    `,
  }),
};

/**
 * All status variants side by side
 */
export const AllVariants: Story = {
  render: (args) => ({
    components: { VcStatus },
    setup() {
      const variants = ["info", "warning", "danger", "success", "light-danger", "info-dark", "primary"];
      return { args, variants };
    },
    template: `
      <div class="tw-space-y-4">
        <div v-for="variant in variants" :key="variant" class="tw-space-y-2">
          <h3 class="tw-font-medium tw-text-sm">{{ variant }}</h3>
          <div class="tw-space-x-2">
            <vc-status :variant="variant">Standard</vc-status>
            <vc-status :variant="variant" extend>Extended</vc-status>
            <vc-status :variant="variant" dot></vc-status>
          </div>
        </div>
      </div>
    `,
  }),
};
