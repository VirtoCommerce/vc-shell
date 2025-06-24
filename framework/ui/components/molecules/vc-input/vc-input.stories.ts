import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInput } from "./";
import { VcButton, VcIcon } from "../..";
import { ref, computed } from "vue";

/**
 * `VcInput` is a versatile input field component that supports a wide range of input types, customization options,
 * and slots. It provides enhanced functionality for text entry with built-in validation states, formatting,
 * and interactive elements.
 */
const meta = {
  title: "Molecules/VcInput",
  component: VcInput,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Input field value (v-model)",
      control: "text",
      table: {
        type: { summary: "string | number | Date | null | undefined" },
        defaultValue: { summary: "undefined" },
        category: "Model",
      },
    },
    label: {
      description: "Text label for the input field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    placeholder: {
      description: "Hint displayed inside the input field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    type: {
      description: "Input field type (text, password, email, etc.)",
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url", "search", "date", "datetime-local", "integer"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "text" },
        category: "Behavior",
      },
    },
    disabled: {
      description: "Disables the input field",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    required: {
      description: "Makes the field required",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Validation",
      },
    },
    error: {
      description: "Enables error state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Validation",
      },
    },
    errorMessage: {
      description: "Error message text",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Validation",
      },
    },
    hint: {
      description: "Helper text displayed below the input field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    tooltip: {
      description: "Tooltip text",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    prefix: {
      description: "Prefix displayed before the text in the input field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    suffix: {
      description: "Suffix displayed after the text in the input field",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    maxlength: {
      description: "Maximum number of characters",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1024" },
        category: "Validation",
      },
    },
    autofocus: {
      description: "Automatically sets focus on the field when loaded",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
    size: {
      description: "Size of the input field",
      control: "select",
      options: ["default", "small"],
      table: {
        type: { summary: "'default' | 'small'" },
        defaultValue: { summary: "'default'" },
        category: "Appearance",
      },
    },
    clearable: {
      description: "Enables a clear button to reset the field",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Behavior",
      },
    },
    loading: {
      description: "Shows a loading spinner inside the input",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    debounce: {
      description: "Debounce delay in milliseconds for value updates",
      control: "number",
      table: {
        type: { summary: "number | string" },
        defaultValue: { summary: "undefined" },
        category: "Behavior",
      },
    },
    name: {
      description: "HTML name attribute for the input element",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Field'" },
        category: "Behavior",
      },
    },
    multilanguage: {
      description: "Indicates if the field supports multiple languages",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Internationalization",
      },
    },
    currentLanguage: {
      description: "Current language code for multilanguage fields",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Internationalization",
      },
    },
    step: {
      description: "Step attribute for number inputs",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "1" },
        category: "Behavior",
      },
    },
    datePickerOptions: {
      description: "Configuration options for the date picker",
      table: {
        type: { summary: "VueDatePickerProps" },
        defaultValue: { summary: "undefined" },
        category: "Date Picker",
      },
    },
  },
  args: {
    label: "Enter text",
    placeholder: "Type something...",
    type: "text",
  },
  parameters: {
    docs: {
      description: {
        component: `
### VcInput Component

The VcInput component provides an enhanced input field with numerous features and customization options:

- **Flexible Input Types**: Supports all standard HTML input types plus custom types like 'integer'
- **Rich Form Integration**: Fully compatible with v-model for two-way data binding and form validation
- **Full Customization**: Offers prefix, suffix, hints, labels, and error messages
- **Slot-Based Structure**: Multiple slots for maximum flexibility in crafting custom input layouts
- **State Management**: Supports loading, error, disabled, and focused states with visual feedback
- **Accessibility Features**: Built-in keyboard navigation and appropriate ARIA attributes
- **Responsive Design**: Adapts to mobile and desktop viewports
- **Date & Time Support**: Integrated date picker for date and datetime inputs
        `,
      },
    },
  },
} satisfies Meta<typeof VcInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the input field component with value display to show the binding.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-space-y-4 tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
          @focus="() => console.log('Focus received')"
          @blur="() => console.log('Focus lost')"
        />
        <div class="tw-p-2 tw-bg-gray-100 tw-rounded">
          <strong>Current value:</strong> "{{ value || 'empty' }}"
        </div>
      </div>
    `,
  }),
};

/**
 * Input field with error message. Error styling is automatically applied.
 */
export const WithError: Story = {
  args: {
    error: true,
    errorMessage: "This field contains an invalid value",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Disabled input field with pre-filled content.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    modelValue: "This input field is disabled",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Input field with additional hint text.
 */
export const WithHint: Story = {
  args: {
    hint: "This hint helps the user understand what to enter in the field",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Input field with tooltip for additional information.
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "This tooltip provides additional information about the field",
    label: "Input with tooltip",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Required input field with visual indicator.
 */
export const Required: Story = {
  args: {
    required: true,
    label: "Required field",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Input field with prefix. Useful for currency, units, or other identifiers.
 */
export const WithPrefix: Story = {
  args: {
    prefix: "$",
    placeholder: "Enter amount",
    type: "number",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Input field with suffix. Useful for units and other visual indicators.
 */
export const WithSuffix: Story = {
  args: {
    suffix: "kg",
    placeholder: "Enter weight",
    type: "number",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Input field with prepend slot for adding buttons or other elements before the input.
 */
export const WithPrepend: Story = {
  render: (args) => ({
    components: { VcInput, VcButton },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #prepend>
            <vc-button>Search</vc-button>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          This example shows using the <code>prepend</code> slot to add a button before the input field.
        </div>
      </div>
    `,
  }),
};

/**
 * Input field with append slot for adding buttons or other elements after the input.
 */
export const WithAppend: Story = {
  render: (args) => ({
    components: { VcInput, VcButton },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          placeholder="Search terms..."
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #append>
            <vc-button>Search</vc-button>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          This example shows using the <code>append</code> slot to add a button after the input field.
        </div>
      </div>
    `,
  }),
};

/**
 * Input field with inner prepend slot for adding icons or other decorative elements inside the input.
 */
export const WithPrependInner: Story = {
  render: (args) => ({
    components: { VcInput, VcButton, VcIcon },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          placeholder="Search..."
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #prepend-inner>
            <VcIcon icon="material-search" />
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          This example shows using the <code>prepend-inner</code> slot to add a search icon inside the input field.
        </div>
      </div>
    `,
  }),
};

/**
 * Input field with inner append slot for adding icons or other decorative elements inside the input.
 */
export const WithAppendInner: Story = {
  render: (args) => ({
    components: { VcInput, VcButton, VcIcon },
    setup() {
      const value = ref("");
      const clearField = () => {
        value.value = "";
      };
      return { args, value, clearField };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          placeholder="Type and click X to clear..."
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #append-inner>
            <VcIcon
              v-if="value"
              icon="material-close"
              class="tw-cursor-pointer tw-text-gray-500 hover:tw-text-gray-700"
              @click="clearField"
            />
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          This example shows using the <code>append-inner</code> slot to add a custom clear button that appears when text is entered.
        </div>
      </div>
    `,
  }),
};

/**
 * Clearable input field that displays an icon to clear the input when a value is present.
 */
export const Clearable: Story = {
  args: {
    clearable: true,
    modelValue: "Type something and clear it using the X icon",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          When a value is present, a clear button appears that allows resetting the field.
        </div>
      </div>
    `,
  }),
};

/**
 * Input field in a smaller size variant.
 */
export const Small: Story = {
  args: {
    size: "small",
    placeholder: "Small input field",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
      </div>
    `,
  }),
};

/**
 * Example showing an input with a loading state.
 */
export const Loading: Story = {
  args: {
    loading: true,
    placeholder: "Loading data...",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          The loading state is useful when fetching data asynchronously.
        </div>
      </div>
    `,
  }),
};

/**
 * Password field with toggle visibility feature.
 */
export const PasswordWithToggle: Story = {
  args: {
    type: "password",
    placeholder: "Enter your password",
    label: "Password",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        />
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          The password field includes a visibility toggle button to show/hide the password.
        </div>
      </div>
    `,
  }),
};

/**
 * Example of using custom error slot to display validation messages.
 */
export const CustomErrorSlot: Story = {
  args: {
    error: true,
  },
  render: (args) => ({
    components: { VcInput, VcIcon },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #error>
            <div class="tw-flex tw-items-center tw-mt-1 tw-text-red-600">
              <VcIcon icon="material-error" class="tw-mr-1" />
              <span>This is a custom error message with an icon</span>
            </div>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          Using the <code>error</code> slot allows full customization of validation messages.
        </div>
      </div>
    `,
  }),
};

/**
 * Example of using a custom hint slot.
 */
export const CustomHintSlot: Story = {
  render: (args) => ({
    components: { VcInput, VcIcon },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          label="Username"
          placeholder="Enter a username"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #hint>
            <div class="tw-flex tw-items-center tw-mt-1 tw-text-gray-600">
              <VcIcon icon="material-info" class="tw-mr-1" />
              <span>Username must be at least 5 characters long</span>
            </div>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          Using the <code>hint</code> slot allows full customization of helper text.
        </div>
      </div>
    `,
  }),
};

/**
 * Example of using the control slot for complete customization of the input element.
 */
export const CustomControlSlot: Story = {
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          label="Custom Input"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #control="{ modelValue, emitValue, placeholder }">
            <div class="tw-w-full tw-h-full tw-flex tw-items-center">
              <input
                :value="modelValue"
                @input="(e) => emitValue(e.target.value)"
                :placeholder="placeholder"
                class="tw-w-full tw-h-full tw-outline-none tw-border-none tw-px-2 tw-bg-gray-100 tw-rounded"
              />
            </div>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          The <code>control</code> slot allows replacing the input element while maintaining v-model behavior.
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstrates input field with character counter for fields with maxlength restriction.
 */
export const WithCharCounter: Story = {
  args: {
    maxlength: 50,
    label: "Message",
    placeholder: "Type your message...",
  },
  render: (args) => ({
    components: { VcInput },
    setup() {
      const value = ref("");
      const charCount = computed(() => value.value?.length || 0);
      const maxLength = args.maxlength || 50;

      return { args, value, charCount, maxLength };
    },
    template: `
      <div class="tw-max-w-lg">
        <vc-input
          v-bind="args"
          v-model="value"
          @update:modelValue="(val) => console.log('Value updated:', val)"
        >
          <template #append-inner>
            <div class="tw-text-xs tw-text-gray-500">
              {{ charCount }}/{{ maxLength }}
            </div>
          </template>
        </vc-input>
        <div class="tw-mt-4 tw-text-gray-600 tw-text-sm">
          This example implements a character counter using the <code>append-inner</code> slot and <code>maxlength</code> property.
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstrates all the different input field types available.
 */
export const InputTypes: Story = {
  render: () => ({
    components: { VcInput },
    setup() {
      const textValue = ref("");
      const passwordValue = ref("");
      const emailValue = ref("");
      const numberValue = ref("");
      const integerValue = ref("");
      const telValue = ref("");
      const urlValue = ref("");
      const dateValue = ref("");
      const datetimeValue = ref("");

      const types = [
        { type: "text", label: "Text field", value: textValue },
        { type: "password", label: "Password", value: passwordValue },
        { type: "email", label: "Email", value: emailValue },
        { type: "number", label: "Number (allows decimals)", value: numberValue },
        { type: "integer", label: "Integer (whole numbers only)", value: integerValue },
        { type: "tel", label: "Phone", value: telValue },
        { type: "url", label: "URL", value: urlValue },
        { type: "date", label: "Date", value: dateValue },
        { type: "datetime-local", label: "Date & Time", value: datetimeValue },
      ];

      return { types };
    },
    template: `
      <div class="tw-space-y-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-4">Available Input Types</h3>

        <vc-input
          v-for="item in types"
          :key="item.type"
          :type="item.type"
          :label="item.label"
          v-model="item.value"
          @update:modelValue="(val) => console.log(item.label + ':', val)"
        />

        <div class="tw-mt-4 tw-p-3 tw-bg-blue-50 tw-rounded tw-text-blue-700 tw-text-sm">
          Each input type has specific validation and formatting behaviors appropriate for its data type.
          <br>
          <br>
          <strong>Special notes:</strong>
          <ul class="tw-list-disc tw-pl-5 tw-mt-1">
            <li>The <code>integer</code> type only allows whole numbers to be entered</li>
            <li>Date and datetime types use a built-in date picker component</li>
            <li>Password type includes a visibility toggle</li>
          </ul>
        </div>
      </div>
    `,
  }),
};
