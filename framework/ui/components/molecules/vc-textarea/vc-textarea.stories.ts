import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcTextarea } from "@ui/components/molecules/vc-textarea";
import { ref } from "vue";

/**
 * `VcTextarea` — a multiline input field component designed for entering large amounts of text.
 * Supports labels, hints, error handling, and other text field features.
 */
const meta = {
  title: "Molecules/VcTextarea",
  component: VcTextarea,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Text area value (v-model)",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    label: {
      description: "Label text displayed above the textarea",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    placeholder: {
      description: "Hint displayed inside the empty textarea",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    disabled: {
      description: "Disables the textarea, making it non-interactive",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description: "Marks the field as required",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    tooltip: {
      description: "Additional information displayed as a tooltip",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    name: {
      description: "HTML name attribute for the textarea element",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Field" },
      },
    },
    maxlength: {
      description: "Maximum number of characters that can be entered",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "1024" },
      },
    },
    error: {
      description: "Enables error state for the textarea",
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
        defaultValue: { summary: "undefined" },
      },
    },
    multilanguage: {
      description: "Enables multilanguage support",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    currentLanguage: {
      description: "Currently selected language for multilanguage mode",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  args: {
    placeholder: "Enter text...",
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcTextarea component is a multiline input field for entering and editing large text data:

- Supports v-model for two-way data binding
- Includes support for labels, placeholders, and error messages
- Shows character counter when maxlength is specified
- Can be configured as a required field
- Supports disabled state
        `,
      },
    },
  },
} satisfies Meta<typeof VcTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic textarea example without additional settings
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Textarea with a label above the field
 */
export const WithLabel: Story = {
  args: {
    label: "Description",
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Disabled textarea, non-interactive
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    modelValue: "This text cannot be changed",
    label: "Disabled field",
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Textarea with error message
 */
export const WithError: Story = {
  args: {
    errorMessage: "The field contains invalid characters",
    error: true,
    label: "Field with error",
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref("Problematic text");
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Required textarea with label
 */
export const Required: Story = {
  args: {
    label: "Required field",
    required: true,
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Textarea with tooltip
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "This hint helps understand what to enter",
    label: "Field with tooltip",
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Textarea with character limit
 */
export const WithMaxLength: Story = {
  args: {
    label: "Limited field",
    maxlength: "50",
    modelValue: "Text with a length limit of 50 characters",
  },
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <vc-textarea
        v-bind="args"
        v-model="value"
        @update:modelValue="(val) => console.log('Text updated:', val)"
      />
    `,
  }),
};

/**
 * Full functional example demonstrating value updates
 */
export const Interactive: Story = {
  render: () => ({
    components: { VcTextarea },
    setup() {
      const value = ref("Change this text");

      return { value };
    },
    template: `
      <div>
        <vc-textarea
          label="Interactive demonstration"
          placeholder="Enter something..."
          v-model="value"
          @update:modelValue="(val) => console.log('Text updated:', val)"
        />
        <div class="tw-mt-4">
          <p><strong>Current value:</strong></p>
          <pre class="tw-bg-gray-100 tw-p-2 tw-rounded tw-mt-2">{{ value }}</pre>
        </div>
      </div>
    `,
  }),
};
