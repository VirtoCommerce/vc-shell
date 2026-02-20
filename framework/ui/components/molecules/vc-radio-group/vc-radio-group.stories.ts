import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcRadioGroup } from "@ui/components/molecules/vc-radio-group";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";

const options = [
  { label: "Card", value: "card" },
  { label: "Invoice", value: "invoice" },
  { label: "Cash", value: "cash" },
];

/**
 * `VcRadioGroup` wraps radio controls into an accessible fieldset/radiogroup.
 */
const meta = {
  title: "Molecules/VcRadioGroup",
  component: VcRadioGroup,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Selected option value",
      control: "text",
      table: {
        type: { summary: "any" },
      },
    },
    options: {
      description: "List of radio options",
      control: "object",
      table: {
        type: { summary: "RadioGroupOption[]" },
      },
    },
    label: {
      description: "Group label",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    hint: {
      description: "Hint text",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    error: {
      description: "Error state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorMessage: {
      description: "Error message",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    disabled: {
      description: "Disables all options",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    orientation: {
      description: "Options layout orientation",
      control: "select",
      options: ["vertical", "horizontal"],
      table: {
        type: { summary: "'vertical' | 'horizontal'" },
        defaultValue: { summary: "'vertical'" },
      },
    },
    name: {
      description: "Shared name for native radios",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
  },
  args: {
    modelValue: "card",
    label: "Payment method",
    hint: "Only one option can be selected",
    options,
    orientation: "vertical",
  },
} satisfies Meta<typeof VcRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic vertical radio group from options.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcRadioGroup },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcRadioGroup v-bind="args" v-model="value" />
        <div class="tw-text-sm tw-text-gray-600">Selected: {{ value }}</div>
      </div>
    `,
  }),
};

/**
 * Horizontal layout.
 */
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => ({
    components: { VcRadioGroup },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <VcRadioGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * One option can be disabled.
 */
export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: "Card", value: "card" },
      { label: "Invoice", value: "invoice", disabled: true },
      { label: "Cash", value: "cash" },
    ],
  },
  render: (args) => ({
    components: { VcRadioGroup },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <VcRadioGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * Group-level validation error.
 */
export const ErrorState: Story = {
  args: {
    modelValue: null,
    required: true,
    error: true,
    errorMessage: "Select one payment method",
  },
  render: (args) => ({
    components: { VcRadioGroup },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <VcRadioGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * Custom rendering via slot while keeping group semantics.
 */
export const CustomSlot: Story = {
  render: () => ({
    components: { VcRadioGroup, VcRadioButton },
    setup: () => {
      const value = ref("weekly");
      return { value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcRadioGroup
          v-model="value"
          label="Newsletter frequency"
          hint="Custom layout through default slot"
          orientation="horizontal"
          name="newsletter-frequency"
        >
          <VcRadioButton v-model="value" value="daily" label="Daily" />
          <VcRadioButton v-model="value" value="weekly" label="Weekly" />
          <VcRadioButton v-model="value" value="monthly" label="Monthly" />
        </VcRadioGroup>
        <div class="tw-text-sm tw-text-gray-600">Selected: {{ value }}</div>
      </div>
    `,
  }),
};

/**
 * Accessibility demo: inspect role, legend and describedby links.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { VcRadioGroup },
    setup: () => {
      const value = ref("card");
      return { value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-4">
        <VcRadioGroup
          v-model="value"
          label="Payment method"
          hint="Inspect radiogroup role and aria-describedby"
          :options="[
            { label: 'Card', value: 'card' },
            { label: 'Invoice', value: 'invoice' },
            { label: 'Cash', value: 'cash' }
          ]"
          name="payment-method"
        />

        <div class="tw-p-3 tw-bg-blue-50 tw-rounded tw-text-blue-700 tw-text-sm">
          <strong>Inspect in DOM:</strong>
          <ul class="tw-list-disc tw-pl-5 tw-mt-1">
            <li>container is a <code>fieldset</code> with <code>role=&quot;radiogroup&quot;</code></li>
            <li><code>legend</code> labels the whole radio set</li>
            <li>all radios share group <code>name</code></li>
            <li>group hint/error is linked by <code>aria-describedby</code></li>
          </ul>
        </div>
      </div>
    `,
  }),
};
