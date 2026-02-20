import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcCheckboxGroup } from "@ui/components/molecules/vc-checkbox-group";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";

const options = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" },
];

/**
 * `VcCheckboxGroup` wraps checkbox controls into an accessible fieldset.
 */
const meta = {
  title: "Molecules/VcCheckboxGroup",
  component: VcCheckboxGroup,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Selected values",
      control: "object",
      table: {
        type: { summary: "any[]" },
      },
    },
    options: {
      description: "List of checkbox options",
      control: "object",
      table: {
        type: { summary: "CheckboxGroupOption[]" },
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
      description: "Shared name for native checkboxes",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    size: {
      description: "Size for all checkbox controls",
      control: "select",
      options: ["s", "m", "l"],
      table: {
        type: { summary: "'s' | 'm' | 'l'" },
        defaultValue: { summary: "'s'" },
      },
    },
  },
  args: {
    modelValue: ["email"],
    label: "Notification channels",
    hint: "You can choose multiple options",
    options,
    orientation: "vertical",
    size: "s",
  },
} satisfies Meta<typeof VcCheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic checkbox group from options.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcCheckboxGroup },
    setup: () => {
      const value = ref<string[]>(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcCheckboxGroup v-bind="args" v-model="value" />
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
    components: { VcCheckboxGroup },
    setup: () => {
      const value = ref<string[]>(args.modelValue);
      return { args, value };
    },
    template: `
      <VcCheckboxGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * One option can be disabled.
 */
export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: "Email", value: "email" },
      { label: "SMS", value: "sms", disabled: true },
      { label: "Push", value: "push" },
    ],
  },
  render: (args) => ({
    components: { VcCheckboxGroup },
    setup: () => {
      const value = ref<string[]>(args.modelValue);
      return { args, value };
    },
    template: `
      <VcCheckboxGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * Group-level validation error.
 */
export const ErrorState: Story = {
  args: {
    modelValue: [],
    required: true,
    error: true,
    errorMessage: "Select at least one channel",
  },
  render: (args) => ({
    components: { VcCheckboxGroup },
    setup: () => {
      const value = ref<string[]>(args.modelValue);
      return { args, value };
    },
    template: `
      <VcCheckboxGroup v-bind="args" v-model="value" />
    `,
  }),
};

/**
 * Custom rendering via slot while keeping group semantics.
 */
export const CustomSlot: Story = {
  render: () => ({
    components: { VcCheckboxGroup, VcCheckbox },
    setup: () => {
      const value = ref<string[]>(["feature-a"]);
      return { value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcCheckboxGroup
          v-model="value"
          label="Feature flags"
          hint="Custom layout through default slot"
          orientation="horizontal"
          name="feature-flags"
        >
          <VcCheckbox v-model="value" value="feature-a">Feature A</VcCheckbox>
          <VcCheckbox v-model="value" value="feature-b">Feature B</VcCheckbox>
          <VcCheckbox v-model="value" value="feature-c">Feature C</VcCheckbox>
        </VcCheckboxGroup>
        <div class="tw-text-sm tw-text-gray-600">Selected: {{ value }}</div>
      </div>
    `,
  }),
};

/**
 * Accessibility demo: inspect fieldset semantics and aria links.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { VcCheckboxGroup },
    setup: () => {
      const value = ref<string[]>(["email"]);
      return { value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-4">
        <VcCheckboxGroup
          v-model="value"
          label="Notification channels"
          hint="Inspect fieldset, legend and aria-describedby"
          :options="[
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Push', value: 'push' }
          ]"
          name="notification-channels"
        />

        <div class="tw-p-3 tw-bg-blue-50 tw-rounded tw-text-blue-700 tw-text-sm">
          <strong>Inspect in DOM:</strong>
          <ul class="tw-list-disc tw-pl-5 tw-mt-1">
            <li>container is a semantic <code>fieldset</code></li>
            <li><code>legend</code> labels the whole checkbox set</li>
            <li>checkboxes share group <code>name</code></li>
            <li>group hint/error is linked by <code>aria-describedby</code></li>
          </ul>
        </div>
      </div>
    `,
  }),
};
