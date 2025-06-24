import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInputCurrency } from "./";
import { ref } from "vue";

/**
 * `VcInputCurrency` is a specialized input component for handling currency values with formatting
 * and currency selection capabilities.
 */
const meta = {
  title: "molecules/VcInputCurrency",
  component: VcInputCurrency,
  //tags: ["autodocs"],
  args: {
    label: "Amount",
    placeholder: "Enter amount",
    options: [
      {
        title: "USD",
        value: "USD",
      },
      {
        title: "EUR",
        value: "EUR",
      },
      {
        title: "GBP",
        value: "GBP",
      },
      {
        title: "JPY",
        value: "JPY",
      },
    ],
    optionLabel: "title",
    optionValue: "value",
    modelValue: 1000000,
  },
  argTypes: {
    modelValue: {
      description: "Numeric value of the input (use with v-model:modelValue)",
      control: "number",
      table: {
        type: { summary: "number | null" },
        defaultValue: { summary: "undefined" },
        category: "Model",
      },
    },
    option: {
      description: "Selected currency option (use with v-model:option)",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "USD" },
        category: "Model",
      },
    },
    options: {
      description: "Available currency options",
      control: "object",
      table: {
        type: { summary: "Array<{ title: string, value: string }>" },
        defaultValue: { summary: "[]" },
      },
    },
    optionLabel: {
      description: "Property of option which holds the label",
      control: "text",
      table: {
        type: { summary: "string | ((option: unknown) => string)" },
        defaultValue: { summary: "title" },
      },
    },
    optionValue: {
      description: "Property of option which holds the value",
      control: "text",
      table: {
        type: { summary: "string | ((option: unknown) => string)" },
        defaultValue: { summary: "value" },
      },
    },
    label: {
      description: "Text label for the input field",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    placeholder: {
      description: "Placeholder text for the input field",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    hint: {
      description: "Helper text displayed below the input field",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    tooltip: {
      description: "Tooltip text for additional information",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    error: {
      description: "Indicates an error state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorMessage: {
      description: "Error message to display",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    disabled: {
      description: "Disables the input field",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description: "Makes the field required",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    loading: {
      description: "Shows a loading indicator",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clearable: {
      description: "Enables a clear button to reset the field",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    prefix: {
      description: "Prefix displayed before the input value",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    suffix: {
      description: "Suffix displayed after the input value",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    precision: {
      description: "Number of decimal places for the currency value",
      control: { type: "select", options: [0, 1, 2, 3, 4] },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "2" },
      },
    },
    currencyDisplay: {
      description: "How to display the currency symbol",
      control: { type: "select", options: ["symbol", "code", "name", "hidden"] },
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "hidden" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcInputCurrency component is a specialized input for handling monetary values with the following features:

- Currency formatting with precision control
- Currency selection from dropdown
- Support for v-model binding for both amount and currency
- All standard input features like labels, placeholders, validation, etc.
- Customizable through slots for additional content
        `,
      },
    },
  },
} satisfies Meta<typeof VcInputCurrency>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic implementation of the currency input with dropdown selection
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
          @update:model-value="val => console.log('Value updated:', val)"
          @update:option="val => console.log('Currency updated:', val)"
        />
        <div class="tw-mt-4 tw-text-sm">
          <strong>Current value:</strong> {{value}} {{option}}
        </div>
      </div>
    `,
  }),
};

/**
 * Input with helper hint text
 */
export const WithHint: Story = {
  args: {
    hint: "Enter the amount in the selected currency",
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * Input with additional tooltip information
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "The currency can be changed using the dropdown",
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * Input in error state with error message
 */
export const WithError: Story = {
  args: {
    errorMessage: "Please enter a valid amount",
    error: true,
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * Disabled input state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * Required input field
 */
export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * With currency symbol prefix
 */
export const WithPrefix: Story = {
  args: {
    prefix: "$",
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * With currency code suffix
 */
export const WithSuffix: Story = {
  args: {
    suffix: "USD",
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * With loading indicator
 */
export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};

/**
 * With different precision values
 */
export const PrecisionOptions: Story = {
  render: () => ({
    components: { VcInputCurrency },
    setup() {
      const value0 = ref(1234.5678);
      const value1 = ref(1234.5678);
      const value2 = ref(1234.5678);
      const value3 = ref(1234.5678);
      const option = ref("USD");

      return { value0, value1, value2, value3, option };
    },
    template: `
      <div style="max-width: 300px;">
        <div class="tw-mb-4">
          <vc-input-currency
            label="No decimals (precision: 0)"
            v-model:model-value="value0"
            v-model:option="option"
            :precision="0"
          />
        </div>
        <div class="tw-mb-4">
          <vc-input-currency
            label="One decimal (precision: 1)"
            v-model:model-value="value1"
            v-model:option="option"
            :precision="1"
          />
        </div>
        <div class="tw-mb-4">
          <vc-input-currency
            label="Two decimals (precision: 2)"
            v-model:model-value="value2"
            v-model:option="option"
            :precision="2"
          />
        </div>
        <div class="tw-mb-4">
          <vc-input-currency
            label="Three decimals (precision: 3)"
            v-model:model-value="value3"
            v-model:option="option"
            :precision="3"
          />
        </div>
      </div>
    `,
  }),
};

/**
 * With clearable option to reset the field
 */
export const Clearable: Story = {
  args: {
    clearable: true,
  },
  render: (args) => ({
    components: { VcInputCurrency },
    setup() {
      const value = ref(args.modelValue);
      const option = ref("USD");

      return { args, value, option };
    },
    template: `
      <div style="max-width: 300px;">
        <vc-input-currency
          v-bind="args"
          v-model:model-value="value"
          v-model:option="option"
        />
      </div>
    `,
  }),
};
