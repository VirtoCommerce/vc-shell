import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcDatePicker } from "./";
import { ref } from "vue";

const meta = {
  title: "Molecules/VcDatePicker",
  component: VcDatePicker,
  tags: ["autodocs"],
  args: {
    label: "Select date",
    placeholder: "Pick a date...",
    type: "date",
  },
  parameters: {
    docs: {
      description: {
        component: `
### VcDatePicker Component

A standalone date picker component extracted from VcInput. Wraps the VueDatePicker library with the standard field chrome (label, error, hint).

- **Date & DateTime**: Supports both \`date\` and \`datetime-local\` types
- **Accessible**: Auto-generated IDs for label association, \`aria-describedby\` for hints/errors, \`aria-invalid\` for error state
- **Consistent styling**: Uses the same CSS variables and shadcn-inspired focus rings as VcInput
        `,
      },
    },
  },
} satisfies Meta<typeof VcDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="tw-mt-4 tw-p-2 tw-bg-gray-100 tw-rounded tw-text-sm">
          <strong>Value:</strong> {{ value ?? 'null' }}
        </div>
      </div>
    `,
  }),
};

export const DateTime: Story = {
  args: {
    type: "datetime-local",
    label: "Select date & time",
    placeholder: "Pick date and time...",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="tw-mt-4 tw-p-2 tw-bg-gray-100 tw-rounded tw-text-sm">
          <strong>Value:</strong> {{ value ?? 'null' }}
        </div>
      </div>
    `,
  }),
};

export const WithError: Story = {
  args: {
    error: true,
    errorMessage: "Please select a valid date",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled date picker",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(new Date());
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Small: Story = {
  args: {
    size: "small",
    label: "Small date picker",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const WithHint: Story = {
  args: {
    hint: "Select a date within the next 30 days",
    label: "Delivery date",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Clearable: Story = {
  args: {
    clearable: true,
    label: "Clearable date",
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref(new Date());
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcDatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};
