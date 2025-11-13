import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcCheckbox } from "./";
import { ref } from "vue";

/**
 * `VcCheckbox` represents a checkbox component for selecting options.
 * Supports various sizes, states, and styling options.
 */
const meta = {
  title: "Molecules/VcCheckbox",
  component: VcCheckbox,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Checkbox value (v-model)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "undefined" },
      },
    },
    disabled: {
      description: "Disables the checkbox, making it non-interactive",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description: "Marks the checkbox as required",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    name: {
      description: "Name for the HTML name attribute of the input element",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Field" },
      },
    },
    errorMessage: {
      description: "Error message to display",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    trueValue: {
      description: "Value representing the checked state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    falseValue: {
      description: "Value representing the unchecked state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    label: {
      description: "Label text displayed above the checkbox",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    tooltip: {
      description: "Tooltip text displayed next to the label",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    size: {
      description: "Size of the checkbox",
      control: "select",
      options: ["s", "m", "l"],
      table: {
        type: { summary: "'s' | 'm' | 'l'" },
        defaultValue: { summary: "'s'" },
      },
    },
    outline: {
      description: "Applies outline style to the checkbox",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    indeterminate: {
      description: "Sets the checkbox to an indeterminate state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    default: {
      description: "Text content next to the checkbox",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "string" },
      },
    },
  },
  args: {
    modelValue: true,
    label: "Checkbox Label",
    default: "Text next to the checkbox",
    size: "s",
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcCheckbox component provides a styled checkbox input element with extended functionality:

- Supports v-model for two-way binding
- Offers three sizes: small (s), medium (m), and large (l)
- Supports error, disabled, and indeterminate states
- Ability to customize labels and tooltips
        `,
      },
    },
  },
} satisfies Meta<typeof VcCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the checkbox component
 */
export const Basic: Story = {
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div>
        <vc-checkbox
          v-bind="args"
          v-model="checked"
          @update:modelValue="(val) => console.log('Value updated:', val)">
          {{args.default}}
        </vc-checkbox>
        <div class="tw-mt-4">Current value: {{checked}}</div>
      </div>
    `,
  }),
};

/**
 * Disabled state of the checkbox
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Required checkbox with label
 */
export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Checkbox with error state and message
 */
export const Error: Story = {
  args: {
    modelValue: false,
    errorMessage: "This field is required",
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Checkbox with tooltip
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "Additional information about the checkbox",
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Checkbox with different sizes
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(true);
      return { checked };
    },
    template: `
      <div class="tw-space-y-4">
        <vc-checkbox v-model="checked" size="s">Small checkbox</vc-checkbox>
        <vc-checkbox v-model="checked" size="m">Medium checkbox</vc-checkbox>
        <vc-checkbox v-model="checked" size="l">Large checkbox</vc-checkbox>
      </div>
    `,
  }),
};

/**
 * Checkbox with indeterminate state
 */
export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(false);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Checkbox with outline style
 */
export const Outline: Story = {
  args: {
    outline: true,
  },
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        {{args.default}}
      </vc-checkbox>
    `,
  }),
};

/**
 * Example of using a custom element in the default slot
 */
export const CustomContent: Story = {
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <vc-checkbox
        v-bind="args"
        v-model="checked"
        @update:modelValue="(val) => console.log('Value updated:', val)">
        <div>
          <span class="tw-font-bold">Custom content</span>
          <p class="tw-text-sm tw-text-gray-500">This is a custom content inside the checkbox</p>
        </div>
      </vc-checkbox>
    `,
  }),
};
