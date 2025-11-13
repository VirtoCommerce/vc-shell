import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcLabel } from "./";

/**
 * `VcLabel` - component for displaying form field labels
 * with additional tooltip support.
 */
const meta = {
  title: "Atoms/VcLabel",
  component: VcLabel,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Label content",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    tooltip: {
      description: "Tooltip content",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    required: {
      description: "Adds a required field indicator (asterisk)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    default: "Field Label",
    tooltip: "Additional information about this field",
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcLabel component is used to display form field labels:

- Supports required state
- Provides the ability to add tooltips
- Used in various form components
        `,
      },
    },
  },
} satisfies Meta<typeof VcLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic example of a label with tooltip
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcLabel },
    setup() {
      return { args };
    },
    template: `
    <vc-label v-bind="args">
      {{args.default}}
      <template #tooltip>{{args.tooltip}}</template>
    </vc-label>`,
  }),
};

/**
 * Label for a required field
 */
export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { VcLabel },
    setup() {
      return { args };
    },
    template: `
    <vc-label v-bind="args">
      {{args.default}}
      <template #tooltip>{{args.tooltip}}</template>
    </vc-label>`,
  }),
};

/**
 * Label without a tooltip
 */
export const WithoutTooltip: Story = {
  args: {
    tooltip: undefined,
  },
  render: (args) => ({
    components: { VcLabel },
    setup() {
      return { args };
    },
    template: `
    <vc-label v-bind="args">
      {{args.default}}
    </vc-label>`,
  }),
};

/**
 * Combined with other form components
 */
export const WithFormField: Story = {
  render: (args) => ({
    components: { VcLabel },
    setup() {
      return { args };
    },
    template: `
    <div class="tw-space-y-2">
      <vc-label v-bind="args">
        {{args.default}}
        <template #tooltip>{{args.tooltip}}</template>
      </vc-label>
      <input
        class="tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2 tw-w-full"
        placeholder="Enter value"
      />
    </div>`,
  }),
};
