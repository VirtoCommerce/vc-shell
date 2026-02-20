import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcColorInput } from "@ui/components/molecules/vc-color-input";
import { ref } from "vue";

const meta = {
  title: "Molecules/VcColorInput",
  component: VcColorInput,
  tags: ["autodocs"],
  args: {
    label: "Pick a color",
    placeholder: "Enter hex color...",
  },
  parameters: {
    docs: {
      description: {
        component: `
### VcColorInput Component

A standalone color input component extracted from VcInput. Combines a text input for hex values with a color swatch square that opens the native color picker.

- **Dual input**: Type hex values or use the native color picker via the swatch
- **Color name support**: Accepts CSS color names (e.g., "red") and converts to hex
- **Accessible**: Auto-generated IDs, \`aria-describedby\`, \`aria-invalid\`
- **Consistent styling**: Uses the same CSS variables and focus rings as VcInput
        `,
      },
    },
  },
} satisfies Meta<typeof VcColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
        <div class="tw-mt-4 tw-p-2 tw-bg-gray-100 tw-rounded tw-text-sm">
          <strong>Value:</strong> "{{ value ?? 'null' }}"
        </div>
      </div>
    `,
  }),
};

export const WithValue: Story = {
  args: {
    label: "Brand color",
    modelValue: "#3b82f6",
  },
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
        <div class="tw-mt-4 tw-p-2 tw-bg-gray-100 tw-rounded tw-text-sm">
          <strong>Value:</strong> "{{ value ?? 'null' }}"
        </div>
      </div>
    `,
  }),
};

export const WithError: Story = {
  args: {
    error: true,
    errorMessage: "Please enter a valid hex color",
    modelValue: "invalid",
  },
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled color",
    modelValue: "#ef4444",
  },
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Clearable: Story = {
  args: {
    clearable: true,
    label: "Clearable color",
    modelValue: "#22c55e",
  },
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const Small: Story = {
  args: {
    size: "small",
    label: "Small color input",
    modelValue: "#a855f7",
  },
  render: (args) => ({
    components: { VcColorInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <VcColorInput v-bind="args" v-model="value" />
      </div>
    `,
  }),
};
