import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3";
import { VcMultivalue } from ".";

/**
 * `VcMultivalue` is a versatile component for handling multiple input values or selecting multiple options
 * from a predefined list.
 */
const meta = {
  title: "molecules/VcMultivalue",
  component: VcMultivalue,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter a value",
    type: "text",
    label: "Multivalue Field",
    name: "multivalueField",
    options: [
      { id: "1", title: "Option 1" },
      { id: "2", title: "Option 2" },
      { id: "3", title: "Option 3" },
      { id: "4", title: "Option 4" },
      { id: "5", title: "Option 5" },
    ],
    optionValue: "id",
    optionLabel: "title",
    multivalue: true,
  },
  argTypes: {
    modelValue: {
      description: "The selected values (v-model)",
      control: "object",
      table: {
        type: { summary: "Array<any>" },
        defaultValue: { summary: "[]" },
        category: "Model",
      },
    },
    type: {
      description: "Input type for manual entry",
      control: "radio",
      options: ["text", "number", "integer"],
      table: {
        type: { summary: "'text' | 'number' | 'integer'" },
        defaultValue: { summary: "text" },
      },
    },
    placeholder: {
      description: "Placeholder text for the input field",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    label: {
      description: "Label text for the field",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    name: {
      description: "Name attribute for the field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Field" },
      },
    },
    hint: {
      description: "Helper text displayed below the component",
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
      description: "Disables the field",
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
    options: {
      description: "Available options for selection",
      control: "object",
      table: {
        type: { summary: "Array<any>" },
        defaultValue: { summary: "[]" },
      },
    },
    optionValue: {
      description: "Property name to use as the option value",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "id" },
      },
    },
    optionLabel: {
      description: "Property name to use as the option label",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "title" },
      },
    },
    multivalue: {
      description: "Enables multiple value selection mode",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    multilanguage: {
      description: "Enable multilanguage support for the label",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
      },
    },
    currentLanguage: {
      description: "Current language code for multilanguage support",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcMultivalue component is a versatile input that allows users to:

- Select multiple options from a dropdown list
- Type and add custom values manually
- Display and manage selected values as tags/chips
- Search within available options
- Customize the display of options and selected values via slots

It supports standard input features like validation, disabled state, labels, hints, and more.
        `,
      },
    },
  },
} satisfies Meta<typeof VcMultivalue>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage with dropdown selection
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue
          v-bind="args"
          v-model="selectedValues"
          @update:model-value="val => console.log('Values updated:', val)"
        />
        <div class="tw-mt-4 tw-text-sm" v-if="selectedValues.length">
          <strong>Selected:</strong>
          <pre class="tw-bg-gray-100 tw-p-2 tw-rounded tw-mt-1">{{ JSON.stringify(selectedValues, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Component in error state with error message
 */
export const WithError: Story = {
  args: {
    errorMessage: "Please select at least one option",
    error: true,
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * Disabled component state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    modelValue: [{ id: "1", title: "Option 1" }],
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref(args.modelValue);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * Component with tooltip information
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "Select multiple options or enter your own values",
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * Component with single value mode (no dropdown)
 */
export const SingleValueMode: Story = {
  args: {
    multivalue: false,
    placeholder: "Type a value and press Enter",
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * Component with help hint
 */
export const WithHint: Story = {
  args: {
    hint: "You can add multiple values by selecting from dropdown or typing",
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * Required field with validation indicator
 */
export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
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
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * With numeric input type
 */
export const NumericType: Story = {
  args: {
    type: "number",
    placeholder: "Enter a number and press Enter",
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues" />
      </div>
    `,
  }),
};

/**
 * With custom dropdown item template
 */
export const CustomOptionDisplay: Story = {
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues">
          <template #option="{ item }">
            <div class="tw-flex tw-items-center tw-gap-2 tw-py-1">
              <div class="tw-w-6 tw-h-6 tw-bg-primary-100 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                {{ item.id }}
              </div>
              <div>
                <div class="tw-font-medium">{{ item.title }}</div>
                <div class="tw-text-xs tw-text-gray-500">Option ID: {{ item.id }}</div>
              </div>
            </div>
          </template>
        </vc-multivalue>
      </div>
    `,
  }),
};

/**
 * With custom selected item display
 */
export const CustomSelectedItemDisplay: Story = {
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues">
          <template #selected-item="{ value, item, remove }">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-bg-primary-100 tw-text-primary-700 tw-px-1 tw-rounded">{{ item.id }}</span>
              <span>{{ value }}</span>
              <button
                class="tw-text-xs tw-ml-1 tw-px-1 tw-bg-gray-200 tw-rounded hover:tw-bg-gray-300"
                @click="remove"
              >
                ✕
              </button>
            </div>
          </template>
        </vc-multivalue>
      </div>
    `,
  }),
};

/**
 * With custom error message slot
 */
export const CustomErrorDisplay: Story = {
  args: {
    error: true,
  },
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues">
          <template #error>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mt-1 tw-text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <span>Please correct this field before continuing</span>
            </div>
          </template>
        </vc-multivalue>
      </div>
    `,
  }),
};

/**
 * With custom hint slot
 */
export const CustomHintDisplay: Story = {
  render: (args) => ({
    components: { VcMultivalue },
    setup() {
      const selectedValues = ref([]);
      return { args, selectedValues };
    },
    template: `
      <div style="max-width: 400px;">
        <vc-multivalue v-bind="args" v-model="selectedValues">
          <template #hint>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mt-1 tw-text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              <span>Custom hint with an icon for better visibility</span>
            </div>
          </template>
        </vc-multivalue>
      </div>
    `,
  }),
};
