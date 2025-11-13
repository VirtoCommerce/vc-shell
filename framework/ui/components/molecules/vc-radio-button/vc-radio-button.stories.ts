import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcRadioButton } from "./";

/**
 * `VcRadioButton` is a selection control that allows users to select a single option from a set.
 * It provides a visual interface for making exclusive choices in forms and other interactive contexts.
 */
const meta = {
  title: "molecules/VcRadioButton",
  component: VcRadioButton,
  tags: ["autodocs"],
  args: {
    modelValue: "Product 1",
    label: "Product 1",
    value: "Product 1",
  },
  argTypes: {
    modelValue: {
      description: "Value binding of the radio button (v-model)",
      control: "text",
      table: {
        type: { summary: "any" },
        category: "Model",
      },
    },
    value: {
      description: "Value of the radio button",
      control: "text",
      table: {
        type: { summary: "any" },
        category: "Content",
      },
    },
    binary: {
      description: "Allows to select a boolean value",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "undefined" },
        category: "Behavior",
      },
    },
    disabled: {
      description: "Disables the radio button",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    name: {
      description: "Name of the radio button",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "RadioField" },
        category: "Identification",
      },
    },
    error: {
      description: "Specifies that the component should have error state style",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    errorMessage: {
      description: "Error message to display",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Content",
      },
    },
    label: {
      description: "Label of the radio button",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Content",
      },
    },
    "onUpdate:modelValue": {
      description: "Event emitted when the radio button value changes",
      table: {
        type: { summary: "(value: any) => void" },
        category: "Events",
      },
      action: "update:modelValue",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcRadioButton component provides a styled radio button control:

- Supports standard radio button behaviors
- Can be grouped to represent mutually exclusive options
- Includes support for labels and error states
- Can be disabled to prevent user interaction
- Supports binary mode for boolean value selection
`,
      },
    },
  },
} satisfies Meta<typeof VcRadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default radio button
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcRadioButton },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `
      <div style="padding: 20px;">
        <VcRadioButton
          v-model="modelValue"
          :value="args.value"
          :label="args.label"
          :disabled="args.disabled"
          :error="args.error"
          :errorMessage="args.errorMessage"
          :name="args.name"
          :binary="args.binary"
        />
        <div class="tw-mt-4">
          <p><strong>Current value:</strong> {{ modelValue }}</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Radio button group with object values
 */
export const Group: Story = {
  render: () => ({
    components: { VcRadioButton },
    setup() {
      const products = ref([
        { id: 1, name: "Product 1" },
        { id: 2, name: "Product 2" },
        { id: 3, name: "Product 3" },
      ]);
      const selectedProduct = ref("Product 1");
      return { products, selectedProduct };
    },
    template: `
      <div style="padding: 20px;">
        <div v-for="product in products" :key="product.id" class="tw-pb-3">
          <VcRadioButton
            v-model="selectedProduct"
            :value="product.name"
            :label="product.name"
          />
        </div>
        <div class="tw-mt-4 tw-p-3 tw-bg-gray-100 tw-rounded">
          <p><strong>Selected product:</strong> {{ selectedProduct }}</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Radio button group with string values
 */
export const StringGroup: Story = {
  render: () => ({
    components: { VcRadioButton },
    setup() {
      const options = ref(["Option A", "Option B", "Option C"]);
      const selectedOption = ref("Option A");
      return { options, selectedOption };
    },
    template: `
      <div style="padding: 20px;">
        <div v-for="option in options" :key="option" class="tw-pb-3">
          <VcRadioButton
            v-model="selectedOption"
            :value="option"
            :label="option"
          />
        </div>
        <div class="tw-mt-4 tw-p-3 tw-bg-gray-100 tw-rounded">
          <p><strong>Selected option:</strong> {{ selectedOption }}</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Disabled radio button
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    label: "This radio button is disabled",
  },
};

/**
 * Radio button with error state
 */
export const Error: Story = {
  args: {
    error: true,
    errorMessage: "This field contains an error",
    label: "Error state radio button",
  },
};

/**
 * Binary mode radio button (for boolean values)
 */
export const Binary: Story = {
  render: () => ({
    components: { VcRadioButton },
    setup() {
      const accepted = ref(false);
      return { accepted };
    },
    template: `
      <div style="padding: 20px;">
        <VcRadioButton
          v-model="accepted"
          :binary="true"
          label="I accept the terms and conditions"
        />
        <div class="tw-mt-4 tw-p-3 tw-bg-gray-100 tw-rounded">
          <p><strong>Terms accepted:</strong> {{ accepted ? 'Yes' : 'No' }}</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Horizontal radio button group
 */
export const HorizontalGroup: Story = {
  render: () => ({
    components: { VcRadioButton },
    setup() {
      const options = ref(["Small", "Medium", "Large"]);
      const selectedSize = ref("Medium");
      return { options, selectedSize };
    },
    template: `
      <div style="padding: 20px;">
        <div class="tw-flex tw-gap-6">
          <div v-for="option in options" :key="option">
            <VcRadioButton
              v-model="selectedSize"
              :value="option"
              :label="option"
              name="size"
            />
          </div>
        </div>
        <div class="tw-mt-4 tw-p-3 tw-bg-gray-100 tw-rounded">
          <p><strong>Selected size:</strong> {{ selectedSize }}</p>
        </div>
      </div>
    `,
  }),
};
