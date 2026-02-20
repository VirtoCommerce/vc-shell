import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcSelect } from "@ui/components/molecules/vc-select";
import { ref, h, computed } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcButton } from "@ui/components/atoms/vc-button";

/**
 * `VcSelect` is a versatile dropdown component for selecting single or multiple options.
 * It supports various data sources, async loading, searching, and extensive customization through slots.
 */
const meta = {
  title: "Molecules/VcSelect",
  component: VcSelect,
  tags: ["autodocs"],
  args: {
    label: "Select",
    placeholder: "Select an option",
    options: [
      { id: 1, title: "Option 1" },
      { id: 2, title: "Option 2" },
      { id: 3, title: "Option 3" },
      { id: 4, title: "Option 4" },
      { id: 5, title: "Option 5" },
    ],
    optionValue: "id",
    optionLabel: "title",
  },
  argTypes: {
    modelValue: {
      description: "Value of the select (v-model)",
      control: "text",
      table: {
        category: "Model",
        type: { summary: "any" },
      },
    },
    options: {
      description: `Options for the select dropdown. Can be an array of objects, an array of primitives, or an async function`,
      control: "object",
      table: {
        category: "Data",
        type: {
          summary: "Array<any> | Function",
          detail: `Can be:
1) Array of objects (with optionValue and optionLabel properties)
2) Array of primitive values (strings, numbers)
3) Async function: (keyword?: string, skip?: number, ids?: string[]) => Promise<{ results: any[] }>`,
        },
      },
    },
    optionValue: {
      description: "Property name or function to get the value from option objects",
      control: "text",
      table: {
        category: "Data",
        type: {
          summary: "string | Function",
          detail: "Property name to use as value or function that returns value from option object",
        },
        defaultValue: { summary: "id" },
      },
    },
    optionLabel: {
      description: "Property name or function to get the display label from option objects",
      control: "text",
      table: {
        category: "Data",
        type: {
          summary: "string | Function",
          detail: "Property name to use as label or function that returns label from option object",
        },
        defaultValue: { summary: "title" },
      },
    },
    label: {
      description: "Label text displayed above the select",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    placeholder: {
      description: "Placeholder text when no value is selected",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    debounce: {
      description: "Debounce time for search input (in milliseconds)",
      control: "number",
      table: {
        category: "Behavior",
        type: { summary: "number" },
        defaultValue: { summary: 300 },
      },
    },
    clearable: {
      description: "Whether the select allows clearing the selected value",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    emitValue: {
      description: "Emit only the value instead of the entire option object",
      control: "boolean",
      table: {
        category: "Model",
        type: { summary: "boolean" },
        defaultValue: { summary: true },
      },
    },
    searchable: {
      description: "Enable searching/filtering options",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    multiple: {
      description: "Allow selecting multiple values",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    disabled: {
      description: "Disable the select component",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    required: {
      description: "Mark the select as required (shows asterisk)",
      control: "boolean",
      table: {
        category: "Validation",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    error: {
      description: "Show the select in error state",
      control: "boolean",
      table: {
        category: "Validation",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    errorMessage: {
      description: "Error message to display below the select",
      control: "text",
      table: {
        category: "Validation",
        type: { summary: "string" },
      },
    },
    hint: {
      description: "Hint text to display below the select",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    tooltip: {
      description: "Tooltip text to display next to the label",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    prefix: {
      description: "Prefix text to display inside the select field",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    suffix: {
      description: "Suffix text to display inside the select field",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    size: {
      description: "Size of the select field",
      control: "select",
      options: ["default", "small"],
      table: {
        category: "Appearance",
        type: { summary: "'default' | 'small'" },
        defaultValue: { summary: "default" },
      },
    },
    mapOptions: {
      description: "Map labels of model from options array",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: true },
      },
    },
    loading: {
      description: "Show loading state",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    outline: {
      description: "Whether to show an outline around the select",
      control: "boolean",
      table: {
        category: "Appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: true },
      },
    },
    control: {
      description: "Slot for customizing the entire control element",
      table: {
        category: "Slots",
        type: { summary: "{ toggleHandler: () => void }" },
      },
    },
    "prepend-inner": {
      description: "Slot for content to prepend inside the select field",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    "append-inner": {
      description: "Slot for content to append inside the select field",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    prepend: {
      description: "Slot for content to prepend outside the select field",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    append: {
      description: "Slot for content to append outside the select field",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    "selected-item": {
      description: "Slot for customizing the selected item display",
      table: {
        category: "Slots",
        type: { summary: "{ index: number, opt: any, selected: boolean, removeAtIndex: Function }" },
      },
    },
    option: {
      description: "Slot for customizing option display in the dropdown",
      table: {
        category: "Slots",
        type: { summary: "{ index: number, opt: any, selected: boolean, toggleOption: Function, label: string }" },
      },
    },
    // error: {
    //   description: "Slot for custom error message",
    //   table: {
    //     category: "Slots",
    //     type: { summary: "VNode | string" },
    //   },
    // },
    // hint: {
    //   description: "Slot for custom hint",
    //   table: {
    //     category: "Slots",
    //     type: { summary: "VNode | string" },
    //   },
    // },
    "no-options": {
      description: "Slot for customizing the 'no options' state",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
A comprehensive select component for Vue 3 with the following features:

## Key Features
- Single and multiple selection modes
- Object and primitive value support
- Async options loading with pagination
- Searchable dropdown
- Rich customization through slots and props
- Keyboard navigation support
- Various states (loading, error, disabled)
- Customizable appearance (prefix, suffix, size)

## Slot System
The component has an extensive slot system for customization:
- \`control\`: Customize the entire control element
- \`prepend\`/\`append\`: Add content before/after the select
- \`prepend-inner\`/\`append-inner\`: Add content inside the select field
- \`selected-item\`: Customize how selected items appear
- \`option\`: Customize how dropdown options appear
- \`error\`/\`hint\`: Custom error/hint messages
- \`no-options\`: Custom message when no options are available

## Usage Example

\`\`\`vue
<template>
  <VcSelect
    v-model="selectedValue"
    :options="options"
    label="Country"
    placeholder="Select a country"
    :searchable="true"
    :clearable="true"
  />
</template>

<script setup>
import { ref } from 'vue';
import { VcSelect } from '@vc-shell/framework';

const options = [
  { id: 'us', title: 'United States' },
  { id: 'ca', title: 'Canada' },
  { id: 'mx', title: 'Mexico' }
];

const selectedValue = ref(null);
</script>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic implementation with an array of objects as options, specifying both label and value properties.
 */
export const Basic: Story = {
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);

      const handleChange = (newValue: any) => {
        console.log("Value changed:", newValue);
      };

      return { args, value, handleChange };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
    v-bind="args"
          v-model="value"
          @update:modelValue="handleChange"
        />
        <div class="tw-mt-4 tw-text-sm">
          <p>Selected value: <code>{{ JSON.stringify(value) }}</code></p>
        </div>
      </div>
    `,
  }),
};

/**
 * Use multiple selection to choose several options at once.
 * The model value will be an array of the selected values.
 */
export const MultipleSelection: Story = {
  args: {
    multiple: true,
    placeholder: "Select multiple options",
    clearable: true,
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref([]);

      const handleChange = (newValue: any) => {
        console.log("Value changed:", newValue);
      };

      return { args, value, handleChange };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
      <VcSelect
        v-bind="args"
          v-model="value"
          @update:modelValue="handleChange"
        />
        <div class="tw-mt-4 tw-text-sm">
          <p>Selected values: <code>{{ JSON.stringify(value) }}</code></p>
        </div>
      </div>
    `,
  }),
};

/**
 * Enable searching to filter options as you type. This is particularly
 * useful for dropdowns with many options.
 */
export const Searchable: Story = {
  args: {
    searchable: true,
    placeholder: "Search and select an option",
    options: [
      { id: 1, title: "Apple" },
      { id: 2, title: "Banana" },
      { id: 3, title: "Cherry" },
      { id: 4, title: "Date" },
      { id: 5, title: "Elderberry" },
      { id: 6, title: "Fig" },
      { id: 7, title: "Grape" },
      { id: 8, title: "Honeydew" },
      { id: 9, title: "Kiwi" },
      { id: 10, title: "Lemon" },
    ],
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
            v-bind="args"
          v-model="value"
        />
      </div>
    `,
  }),
};

/**
 * Loading data asynchronously with a function that returns a Promise.
 * This example simulates fetching data from an API.
 */
export const AsyncOptions: Story = {
  args: {
    searchable: true,
    label: "Users",
    placeholder: "Search for a user",
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);

      // Mock API function that simulates fetching data
      const fetchUsers = async (keyword = "", skip = 0) => {
        console.log(`Fetching users with keyword: ${keyword}, skip: ${skip}`);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const allUsers = [
          { id: 1, title: "John Smith" },
          { id: 2, title: "Jane Doe" },
          { id: 3, title: "Alice Johnson" },
          { id: 4, title: "Bob Brown" },
          { id: 5, title: "Charlie Davis" },
          { id: 6, title: "Diana Evans" },
          { id: 7, title: "Edward Frank" },
          { id: 8, title: "Grace Garcia" },
          { id: 9, title: "Henry Hill" },
          { id: 10, title: "Isabel Irwin" },
        ];

        // Filter users by keyword if provided
        let filteredUsers = keyword
          ? allUsers.filter((user) => user.title.toLowerCase().includes(keyword.toLowerCase()))
          : allUsers;

        // Simulate pagination
        filteredUsers = filteredUsers.slice(skip, skip + 5);

        return {
          results: filteredUsers,
          totalCount: filteredUsers.length,
        };
      };

      return { args, value, fetchUsers };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
          v-bind="args"
          v-model="value"
          :options="fetchUsers"
        />
        <div class="tw-mt-4 tw-text-sm tw-text-gray-600">
          Type to search for users. Results are loaded asynchronously.
        </div>
      </div>
    `,
  }),
};

/**
 * You can make the select display various states like disabled, loading,
 * error or required.
 */
export const States: Story = {
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const standardValue = ref(null);
      const disabledValue = ref(2);
      const loadingValue = ref(null);
      const errorValue = ref(null);
      const requiredValue = ref(null);

      return {
        args,
        standardValue,
        disabledValue,
        loadingValue,
        errorValue,
        requiredValue,
      };
    },
    template: `
      <div class="tw-p-4 tw-space-y-6">
        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Standard</h3>
        <VcSelect
            v-bind="args"
            v-model="standardValue"
            label="Standard Select"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Disabled</h3>
          <VcSelect
            v-bind="args"
            v-model="disabledValue"
            label="Disabled Select"
            :disabled="true"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Loading</h3>
          <VcSelect
            v-bind="args"
            v-model="loadingValue"
            label="Loading Select"
            :loading="true"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Error</h3>
          <VcSelect
            v-bind="args"
            v-model="errorValue"
            label="Error Select"
            :error="true"
            errorMessage="This field has an error"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Required</h3>
          <VcSelect
            v-bind="args"
            v-model="requiredValue"
            label="Required Select"
            :required="true"
          />
        </div>
      </div>
    `,
  }),
};

/**
 * You can customize the appearance with props like size, hint,
 * tooltip, prefix, and suffix.
 */
export const Appearance: Story = {
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const standardValue = ref(null);
      const smallValue = ref(null);
      const tooltipValue = ref(null);
      const hintValue = ref(null);
      const prefixSuffixValue = ref(null);

      return {
        args,
        standardValue,
        smallValue,
        tooltipValue,
        hintValue,
        prefixSuffixValue,
      };
    },
    template: `
      <div class="tw-p-4 tw-space-y-6">
        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Default Size</h3>
        <VcSelect
            v-bind="args"
            v-model="standardValue"
            label="Default Size"
            size="default"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Small Size</h3>
          <VcSelect
            v-bind="args"
            v-model="smallValue"
            label="Small Size"
            size="small"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">With Tooltip</h3>
          <VcSelect
            v-bind="args"
            v-model="tooltipValue"
            label="With Tooltip"
            tooltip="This is a helpful tooltip"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">With Hint</h3>
          <VcSelect
            v-bind="args"
            v-model="hintValue"
            label="With Hint"
            hint="This is a helpful hint below the select"
          />
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">With Prefix & Suffix</h3>
          <VcSelect
            v-bind="args"
            v-model="prefixSuffixValue"
            label="With Prefix & Suffix"
            prefix="$"
            suffix="USD"
          />
        </div>
      </div>
    `,
  }),
};

/**
 * The component supports a wide range of slots to customize its appearance.
 * This example demonstrates various slot customizations.
 */
export const CustomizingWithSlots: Story = {
  args: {
    searchable: true,
    multiple: true,
    clearable: true,
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref([]);

      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
            v-bind="args"
          v-model="value"
          label="Customized Select"
        >
          <!-- Customizing the appearance of selected items -->
          <template #selected-item="{ opt }">
            <div class="tw-flex tw-items-center">
              <span class="tw-w-3 tw-h-3 tw-rounded-full tw-bg-blue-500 tw-mr-2"></span>
              <strong class="tw-text-blue-700">{{ opt.title }}</strong>
            </div>
          </template>

          <!-- Customizing option appearance in dropdown -->
          <template #option="{ opt, selected }">
            <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-1">
              <div class="tw-flex tw-items-center">
                <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-gray-400 tw-mr-2"></span>
                {{ opt.title }}
              </div>
              <VcIcon
                v-if="selected"
                icon="material-check"
                class="tw-text-green-600"
                size="s"
              />
            </div>
          </template>

          <!-- Adding content inside the field -->
          <template #prepend-inner>
            <VcIcon icon="material-search" class="tw-mr-2" size="s" />
          </template>

          <!-- Adding content outside the field -->
          <template #append>
            <button
              class="tw-ml-2 tw-bg-blue-100 tw-text-blue-700 tw-px-2 tw-py-1 tw-rounded hover:tw-bg-blue-200"
              @click="value = args.options.map(o => o.id)"
            >
              Select All
            </button>
          </template>

          <!-- Custom "no options" message -->
          <template #no-options>
            <div class="tw-text-center tw-py-3 tw-text-gray-500">
              <VcIcon icon="material-error" class="tw-mb-2" />
              <p>No matching options found</p>
            </div>
          </template>

          <!-- Custom hint -->
          <template #hint>
            <div class="tw-flex tw-items-center tw-text-blue-600">
              <VcIcon icon="material-info" class="tw-mr-1" size="xs" />
              <span>Select multiple options as needed</span>
            </div>
          </template>
        </VcSelect>
      </div>
    `,
  }),
};

/**
 * You can completely override the control element with the control slot.
 * This allows for creating custom triggers for the dropdown.
 */
export const CustomControl: Story = {
  args: {
    clearable: true,
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);

      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
          v-bind="args"
          v-model="value"
          label="Custom Control"
        >
          <template #control="{ toggleHandler }">
            <button
              class="tw-w-full tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-justify-between hover:tw-bg-blue-100"
              @click="toggleHandler"
            >
              <div class="tw-flex tw-items-center">
                <VcIcon icon="fas fa-list-ul" class="tw-mr-2" size="s" />
                <span v-if="value">Option {{ value }} selected</span>
                <span v-else class="tw-text-gray-500">Click to select an option</span>
              </div>
              <VcIcon icon="lucide-chevron-down" size="s" />
            </button>
          </template>
        </VcSelect>
      </div>
    `,
  }),
};

/**
 * Using primitive values (strings, numbers) as options instead of objects.
 */
export const PrimitiveOptions: Story = {
  args: {
    options: ["Red", "Green", "Blue", "Yellow", "Purple"],
    optionValue: undefined,
    optionLabel: undefined,
    clearable: true,
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);

      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
            v-bind="args"
          v-model="value"
          label="Colors"
        />
        <div class="tw-mt-4 tw-text-sm">
          <p>Selected color: <code>{{ value }}</code></p>
        </div>
      </div>
    `,
  }),
};

/**
 * The emitValue prop controls whether the v-model contains just the value or the entire option object.
 */
export const EmitValueOptions: Story = {
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const valueOnly = ref(null);
      const objectValue = ref(null);

      return { args, valueOnly, objectValue };
    },
    template: `
      <div class="tw-p-4 tw-space-y-6">
        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Emit Value Only (emitValue: true)</h3>
          <VcSelect
    v-bind="args"
            v-model="valueOnly"
            label="Value Only"
            :emitValue="true"
          />
          <div class="tw-mt-1 tw-text-sm">
            <p>Model: <code>{{ JSON.stringify(valueOnly) }}</code></p>
          </div>
        </div>

        <div class="tw-max-w-sm">
          <h3 class="tw-text-sm tw-font-medium tw-mb-2">Emit Full Object (emitValue: false)</h3>
          <VcSelect
            v-bind="args"
            v-model="objectValue"
            label="Object Value"
            :emitValue="false"
          />
          <div class="tw-mt-1 tw-text-sm">
            <p>Model: <code>{{ JSON.stringify(objectValue) }}</code></p>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Use custom functions to extract the value and label from option objects
 */
export const CustomGetters: Story = {
  args: {
    options: [
      { code: "US", name: "United States", population: 331000000 },
      { code: "CA", name: "Canada", population: 38000000 },
      { code: "MX", name: "Mexico", population: 126000000 },
      { code: "BR", name: "Brazil", population: 212000000 },
      { code: "FR", name: "France", population: 67000000 },
    ],
    label: "Countries",
    clearable: true,
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);

      // Custom getter functions instead of string properties
      const getOptionValue = (option) => option.code;
      const getOptionLabel = (option) => `${option.name} (${option.code})`;

      return { args, value, getOptionValue, getOptionLabel };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
          v-bind="args"
          v-model="value"
          :optionValue="getOptionValue"
          :optionLabel="getOptionLabel"
        />
        <div class="tw-mt-4 tw-text-sm">
          <p>Selected country code: <code>{{ value }}</code></p>
        </div>
      </div>
    `,
  }),
};

/**
 * Detailed demonstration of the option slot, which allows custom rendering of each option in the dropdown.
 * This is useful for creating rich dropdown items with icons, badges, or additional information.
 */
export const CustomOptionSlot: Story = {
  args: {
    searchable: true,
    clearable: true,
    options: [
      { id: 1, title: "Draft", color: "gray", icon: "fas fa-pencil-alt" },
      { id: 2, title: "Published", color: "green", icon: "material-check_circle" },
      { id: 3, title: "Archived", color: "amber", icon: "fas fa-archive" },
      { id: 4, title: "Deleted", color: "red", icon: "material-delete" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);

      const getStatusColor = (color) => {
        const colors = {
          gray: "tw-bg-gray-200 tw-text-gray-800",
          green: "tw-bg-green-100 tw-text-green-800",
          amber: "tw-bg-amber-100 tw-text-amber-800",
          red: "tw-bg-red-100 tw-text-red-800",
        };
        return colors[color] || colors.gray;
      };

      return { args, value, getStatusColor };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Custom Option Display</h3>
        <VcSelect
    v-bind="args"
          v-model="value"
          label="Select Status"
          placeholder="Choose document status"
        >
          <template #option="{ opt, selected }">
            <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-py-1">
              <div class="tw-flex tw-items-center">
                <div :class="['tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-mr-3', getStatusColor(opt.color)]">
                  <VcIcon :icon="opt.icon" size="s" />
                </div>
                <div>
                  <div class="tw-font-medium">{{ opt.title }}</div>
                  <div class="tw-text-xs tw-text-gray-500">Status ID: {{ opt.id }}</div>
                </div>
              </div>
              <VcIcon
                v-if="selected"
                icon="material-check"
                class="tw-text-green-600"
                size="s"
              />
            </div>
      </template>
        </VcSelect>

        <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
          <p class="tw-text-gray-700 tw-mb-2"><strong>Selected value:</strong> {{ value }}</p>
          <p class="tw-text-gray-500">The option slot above customizes each dropdown item with an icon, label, and description.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Detailed demonstration of the selected-item slot, which allows custom rendering of
 * the selected values in the input field. This is particularly useful for multiple selection.
 */
export const CustomSelectedItemSlot: Story = {
  args: {
    multiple: true,
    clearable: true,
    options: [
      { id: "red", title: "Red", hex: "#f87171" },
      { id: "blue", title: "Blue", hex: "#60a5fa" },
      { id: "green", title: "Green", hex: "#4ade80" },
      { id: "purple", title: "Purple", hex: "#c084fc" },
      { id: "yellow", title: "Yellow", hex: "#fbbf24" },
      { id: "pink", title: "Pink", hex: "#f472b6" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref([]);

      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Custom Selected Item Display</h3>
        <VcSelect
    v-bind="args"
          v-model="value"
          label="Select Colors"
          placeholder="Choose your favorite colors"
        >
          <!-- Custom rendering of selected items -->
          <template #selected-item="{ opt, removeAtIndex, index }">
            <div
              class="tw-flex tw-items-center tw-px-2 tw-py-1 tw-rounded-full tw-mr-1"
              :style="{ backgroundColor: opt.hex + '33', color: opt.hex }"
            >
              <span
                class="tw-w-3 tw-h-3 tw-rounded-full tw-mr-1"
                :style="{ backgroundColor: opt.hex }"
              ></span>
              {{ opt.title }}
              <VcIcon
                icon="lucide-x"
                size="xs"
                class="tw-ml-1 tw-cursor-pointer hover:tw-opacity-80"
                @click.stop="removeAtIndex(index)"
              />
            </div>
      </template>

          <!-- Custom rendering of dropdown options -->
          <template #option="{ opt, selected }">
            <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-py-1">
              <div class="tw-flex tw-items-center">
                <span
                  class="tw-w-4 tw-h-4 tw-rounded tw-mr-2"
                  :style="{ backgroundColor: opt.hex }"
                ></span>
                {{ opt.title }}
                <span class="tw-text-xs tw-ml-2 tw-text-gray-500">{{ opt.hex }}</span>
              </div>
              <VcIcon
                v-if="selected"
                icon="material-check"
                class="tw-text-green-600"
                size="s"
              />
            </div>
          </template>
        </VcSelect>

        <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
          <p class="tw-text-gray-700 tw-mb-2"><strong>Selected values:</strong> {{ value.join(', ') }}</p>
          <p class="tw-text-gray-500">The selected-item slot above customizes how each selected color is displayed as a badge.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstration of using the prepend-inner and append-inner slots to add custom elements
 * inside the select input field. This is useful for adding icons, buttons or other interactive elements.
 */
export const InnerSlots: Story = {
  args: {
    clearable: true,
    placeholder: "Search in categories",
    options: [
      { id: 1, title: "Electronics" },
      { id: 2, title: "Clothing" },
      { id: 3, title: "Home & Kitchen" },
      { id: 4, title: "Books" },
      { id: 5, title: "Sports & Outdoors" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);
      const resetValue = () => {
        value.value = null;
      };

      return { args, value, resetValue };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Inner Prepend & Append Slots</h3>
        <VcSelect
    v-bind="args"
          v-model="value"
          label="Category"
          searchable
        >
          <!-- Adding a search icon at the beginning of the field -->
          <template #prepend-inner>
            <div class="tw-flex tw-items-center tw-text-gray-500">
              <VcIcon icon="material-search" size="s" />
            </div>
          </template>

          <!-- Adding a clear button at the end of the field -->
      <template #append-inner>
            <div
              v-if="value"
              class="tw-flex tw-items-center tw-text-gray-400 hover:tw-text-gray-700 tw-cursor-pointer"
              @click.stop="resetValue"
            >
              <VcIcon icon="material-cancel" size="s" />
            </div>
      </template>
        </VcSelect>

        <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
          <p class="tw-text-gray-700 tw-mb-2"><strong>How it works:</strong></p>
          <ul class="tw-text-gray-500 tw-list-disc tw-pl-5 tw-space-y-1">
            <li>The <code>prepend-inner</code> slot adds a search icon inside the field at the beginning</li>
            <li>The <code>append-inner</code> slot adds a custom clear button that appears when a value is selected</li>
          </ul>
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstration of using the prepend and append slots to add elements outside the select field.
 * This is useful for creating compound controls or add-ons.
 */
export const OuterSlots: Story = {
  args: {
    clearable: true,
    options: [
      { id: "USD", title: "US Dollar" },
      { id: "EUR", title: "Euro" },
      { id: "GBP", title: "British Pound" },
      { id: "JPY", title: "Japanese Yen" },
      { id: "CAD", title: "Canadian Dollar" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);
      const amount = ref("");

      return { args, value, amount };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Outer Prepend & Append Slots</h3>
        <div class="tw-mb-6">
          <VcSelect
    v-bind="args"
            v-model="value"
            label="Currency Converter"
            placeholder="Select currency"
          >
            <!-- Adding an input field before the select -->
      <template #prepend>
              <div class="tw-flex tw-items-center tw-border tw-border-r-0 tw-border-gray-300 tw-rounded-l tw-px-3 tw-h-[36px] tw-bg-white">
                <span class="tw-text-gray-500">$</span>
              </div>
      </template>

            <!-- Adding a button after the select -->
      <template #append>
              <button class="tw-flex tw-items-center tw-bg-blue-500 tw-text-white tw-px-4 tw-h-[36px] tw-rounded-r hover:tw-bg-blue-600">
                <VcIcon icon="fas fa-exchange-alt" size="s" class="tw-mr-1" />
                Convert
              </button>
      </template>
          </VcSelect>

          <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
            <p class="tw-text-gray-700 tw-mb-2"><strong>How it works:</strong></p>
            <ul class="tw-text-gray-500 tw-list-disc tw-pl-5 tw-space-y-1">
              <li>The <code>prepend</code> slot adds a currency symbol outside the field</li>
              <li>The <code>append</code> slot adds a conversion button after the field</li>
              <li>These outer slots help create a compound control with attached elements</li>
            </ul>
          </div>
        </div>

        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Search Input with Button</h3>
        <VcSelect
    v-bind="args"
          v-model="value"
          placeholder="Search products..."
          searchable
        >
          <!-- Adding a select-category label before the field -->
          <template #prepend>
            <div class="tw-px-3 tw-flex tw-items-center tw-bg-gray-100 tw-border tw-border-r-0 tw-border-gray-300 tw-rounded-l tw-h-[36px]">
              <span class="tw-text-gray-700 tw-text-sm">Category</span>
            </div>
      </template>

          <!-- Adding a search button after the field -->
          <template #append>
            <button class="tw-px-4 tw-flex tw-items-center tw-bg-primary-500 tw-text-white tw-h-[36px] tw-rounded-r hover:tw-bg-primary-600">
              <VcIcon icon="material-search" size="s" class="tw-mr-1" />
              Search
            </button>
          </template>
        </VcSelect>
      </div>
    `,
  }),
};

/**
 * Demonstration of using the error and hint slots to provide custom feedback messages.
 */
export const CustomMessagingSlots: Story = {
  args: {
    label: "Product Category",
    clearable: true,
    options: [
      { id: 1, title: "Electronics" },
      { id: 2, title: "Clothing" },
      { id: 3, title: "Home & Kitchen" },
      { id: 4, title: "Books" },
      { id: 5, title: "Sports & Outdoors" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);
      const showError = ref(false);

      const toggleError = () => {
        showError.value = !showError.value;
      };

      return { args, value, showError, toggleError };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Custom Error & Hint Messages</h3>

        <div class="tw-mb-2">
          <button
            class="tw-px-3 tw-py-1 tw-text-sm tw-rounded tw-mr-2"
            :class="showError ? 'tw-bg-red-100 tw-text-red-700' : 'tw-bg-blue-100 tw-text-blue-700'"
            @click="toggleError"
          >
            {{ showError ? 'Show Hint' : 'Show Error' }}
          </button>
        </div>

        <VcSelect
    v-bind="args"
          v-model="value"
          :error="showError"
          errorMessage="This is the standard error message"
          hint="This is the standard hint message"
        >
          <!-- Custom error message with icon and formatting -->
      <template #error>
            <div class="tw-flex tw-items-start tw-mt-1 tw-p-2 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded">
              <VcIcon icon="fas fa-exclamation-triangle" class="tw-text-red-500 tw-mr-2 tw-mt-0.5" size="s" />
              <div>
                <p class="tw-text-red-700 tw-font-medium">Category selection required</p>
                <p class="tw-text-red-600 tw-text-xs">Please select a product category to continue with your submission.</p>
              </div>
            </div>
      </template>

          <!-- Custom hint with additional help information -->
      <template #hint>
            <div class="tw-flex tw-items-start tw-mt-1 tw-p-2 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded">
              <VcIcon icon="material-info" class="tw-text-blue-500 tw-mr-2 tw-mt-0.5" size="s" />
              <div>
                <p class="tw-text-blue-700 tw-font-medium">Choosing the right category</p>
                <p class="tw-text-blue-600 tw-text-xs">The category helps determine which department will process your request.</p>
              </div>
            </div>
      </template>
        </VcSelect>

        <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
          <p class="tw-text-gray-700 tw-mb-2"><strong>How it works:</strong></p>
          <ul class="tw-text-gray-500 tw-list-disc tw-pl-5 tw-space-y-1">
            <li>The <code>error</code> slot replaces the standard error message with a custom component</li>
            <li>The <code>hint</code> slot replaces the standard hint with a more detailed explanation</li>
            <li>Use the toggle button to switch between error and hint states</li>
          </ul>
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstration of the no-options slot to customize the display when there are no options
 * available or when a search returns no results.
 */
export const CustomNoOptionsSlot: Story = {
  args: {
    searchable: true,
    label: "Search Products",
    placeholder: "Type to search...",
    options: [
      { id: 1, title: "Laptop" },
      { id: 2, title: "Smartphone" },
      { id: 3, title: "Headphones" },
      { id: 4, title: "Keyboard" },
      { id: 5, title: "Monitor" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref(null);

      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Custom "No Options" Display</h3>
        <VcSelect
    v-bind="args"
          v-model="value"
        >
          <template #no-options>
            <div class="tw-py-4 tw-px-3 tw-text-center">
              <VcIcon
                icon="material-search"
                class="tw-text-gray-400 tw-mb-2 tw-text-2xl"
              />
              <p class="tw-text-gray-600 tw-font-medium">No matching products found</p>
              <p class="tw-text-gray-500 tw-text-sm">Try different search terms or browse all categories</p>
              <button
                class="tw-mt-2 tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-700 tw-rounded tw-text-sm hover:tw-bg-blue-200"
              >
                Browse All Products
              </button>
            </div>
          </template>
        </VcSelect>

        <div class="tw-mt-4 tw-text-sm tw-bg-gray-50 tw-p-3 tw-rounded">
          <p class="tw-text-gray-700 tw-mb-2"><strong>How to test:</strong></p>
          <p class="tw-text-gray-500">Type a search term that doesn't match any options (like "xyz") to see the custom no-options slot in action.</p>
          <p class="tw-mt-2 tw-text-gray-500">The custom no-options slot provides:
            <ul class="tw-list-disc tw-pl-5 tw-mt-1 tw-space-y-1">
              <li>A more helpful message to guide users</li>
              <li>Visual indication with an icon</li>
              <li>A call-to-action button for alternative options</li>
            </ul>
          </p>
        </div>
      </div>
    `,
  }),
};

/**
 * Comprehensive example showing how to completely customize the VcSelect component
 * using multiple slots together to create a rich user interface.
 */
export const ComprehensiveSlotExample: Story = {
  args: {
    searchable: true,
    multiple: true,
    clearable: true,
    options: [
      { id: 1, title: "Electronics", icon: "fas fa-microchip", level: "Enterprise", color: "#0078d7" },
      { id: 2, title: "Industrial", icon: "fas fa-industry", level: "Mid-Market", color: "#e07c24" },
      { id: 3, title: "Office Supplies", icon: "fas fa-paperclip", level: "SMB", color: "#009688" },
      { id: 4, title: "Medical Equipment", icon: "fas fa-medkit", level: "Enterprise", color: "#e91e63" },
      { id: 5, title: "Construction", icon: "fas fa-hard-hat", level: "Mid-Market", color: "#ffc107" },
      { id: 6, title: "Food & Beverage", icon: "fas fa-utensils", level: "SMB", color: "#8bc34a" },
      { id: 7, title: "Automotive", icon: "fas fa-car", level: "Mid-Market", color: "#3f51b5" },
    ],
  },
  render: (args) => ({
    components: { VcSelect, VcIcon },
    setup() {
      const value = ref([]);

      const getLevelBadge = (level: string) => {
        const badges = {
          SMB: "tw-bg-green-100 tw-text-green-800",
          "Mid-Market": "tw-bg-blue-100 tw-text-blue-800",
          Enterprise: "tw-bg-purple-100 tw-text-purple-800",
        };
        return badges[level];
      };

      const selectAll = () => {
        value.value = args.options.map((opt) => opt.id);
      };

      const clearAll = () => {
        value.value = [];
      };

      return { args, value, getLevelBadge, selectAll, clearAll };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg">
        <h3 class="tw-text-lg tw-font-medium tw-mb-3">Complete VcSelect Customization</h3>

        <VcSelect
    v-bind="args"
          v-model="value"
          label="Product Categories"
          placeholder="Select product categories"
          hint="Choose multiple categories available in your marketplace"
        >
          <!-- Custom control wrapper -->
          <template #control="{ toggleHandler }">
            <div class="tw-border tw-border-gray-300 tw-rounded-lg tw-overflow-hidden tw-shadow-sm">
              <!-- Custom header -->
              <div class="tw-bg-gray-50 tw-px-3 tw-py-2 tw-border-b tw-border-gray-300 tw-flex tw-justify-between tw-items-center">
                <div class="tw-flex tw-items-center">
                  <VcIcon icon="fas fa-tags" class="tw-text-gray-600 tw-mr-2" size="s" />
                  <span class="tw-font-medium tw-text-gray-700">B2B Category Selector</span>
                </div>
                <div class="tw-flex tw-space-x-2">
                  <button
                    class="tw-px-2 tw-py-1 tw-text-xs tw-bg-blue-50 tw-text-blue-700 tw-rounded hover:tw-bg-blue-100"
                    @click.stop="selectAll"
                  >
                    All
                  </button>
                  <button
                    class="tw-px-2 tw-py-1 tw-text-xs tw-bg-gray-100 tw-text-gray-700 tw-rounded hover:tw-bg-gray-200"
                    @click.stop="clearAll"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <!-- Custom selection area -->
              <div
                class="tw-px-3 tw-py-2 tw-bg-white tw-min-h-[40px] tw-flex tw-flex-wrap tw-gap-2 tw-cursor-pointer"
                @click.stop="toggleHandler"
              >
                <template v-if="value.length === 0">
                  <span class="tw-text-gray-400 tw-text-sm">Click to select categories...</span>
      </template>
                <template v-else>
                  <div
                    v-for="(id, index) in value"
                    :key="id"
                    class="tw-flex tw-items-center tw-px-2 tw-py-1 tw-rounded"
                    :style="{ backgroundColor: args.options.find(o => o.id === id)?.color + '22' }"
                  >
                    <VcIcon
                      :icon="args.options.find(o => o.id === id)?.icon"
                      class="tw-mr-1"
                      size="s"
                      :style="{ color: args.options.find(o => o.id === id)?.color }"
                    />
                    <span class="tw-text-sm">{{ args.options.find(o => o.id === id)?.title }}</span>
                    <VcIcon
                      icon="lucide-x"
                      size="xs"
                      class="tw-ml-1 tw-cursor-pointer hover:tw-opacity-80"
                      @click.stop="value.splice(index, 1)"
                    />
                  </div>
                </template>
              </div>

              <!-- Custom footer -->
              <div class="tw-bg-gray-50 tw-px-3 tw-py-2 tw-border-t tw-border-gray-300 tw-flex tw-justify-between tw-items-center">
                <span class="tw-text-xs tw-text-gray-500">Selected: {{ value.length }} of {{ args.options.length }}</span>
                <VcIcon
                  icon="lucide-chevron-down"
                  class="tw-text-gray-400"
                  size="s"
                />
              </div>
            </div>
          </template>

          <!-- Custom option rendering -->
          <template #option="{ opt, selected, toggleOption }">
            <div
              class="tw-flex tw-items-center tw-justify-between tw-w-full tw-p-2 tw-cursor-pointer hover:tw-bg-gray-50"
              @click.stop="toggleOption(opt)"
            >
              <div class="tw-flex tw-items-center">
                <div
                  class="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-mr-3"
                  :style="{ backgroundColor: opt.color + '22', color: opt.color }"
                >
                  <VcIcon :icon="opt.icon" />
                </div>
                <div>
                  <div class="tw-font-medium">{{ opt.title }}</div>
                  <div class="tw-flex tw-items-center tw-mt-1">
                    <span
                      :class="['tw-text-xs tw-px-2 tw-py-0.5 tw-rounded-full', getLevelBadge(opt.level)]"
                    >
                      {{ opt.level }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                class="tw-w-5 tw-h-5 tw-rounded-sm tw-flex tw-items-center tw-justify-center"
                :class="selected ? 'tw-bg-blue-500' : 'tw-border tw-border-gray-300'"
              >
                <VcIcon
                  v-if="selected"
                  icon="material-check"
                  class="tw-text-white"
                  size="xs"
                />
              </div>
            </div>
          </template>

          <!-- Custom no-options message -->
          <template #no-options>
            <div class="tw-p-4 tw-text-center tw-border-t tw-border-gray-200">
              <VcIcon icon="material-search" class="tw-text-gray-400 tw-mb-2" />
              <p class="tw-text-gray-600">No matching categories found</p>
              <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Try searching for other product types or industries</p>
            </div>
          </template>

          <!-- Custom hint -->
          <template #hint>
            <div class="tw-flex tw-items-start tw-mt-2">
              <VcIcon icon="fas fa-lightbulb" class="tw-text-yellow-500 tw-mr-2 tw-mt-0.5" size="s" />
              <div class="tw-text-sm tw-text-gray-600">
                Select the product categories available in your marketplace to help buyers find relevant offerings.
              </div>
            </div>
          </template>
        </VcSelect>
      </div>
    `,
  }),
};

/**
 * Gallery showing all visual states side by side.
 * Useful for quickly comparing default, focused, error, disabled, and loading states.
 */
export const AllStates: Story = {
  render: () => ({
    components: { VcSelect },
    setup() {
      const val1 = ref(null);
      const val2 = ref(2);
      const val3 = ref(null);
      const val4 = ref(1);
      const val5 = ref(null);
      const opts = [
        { id: 1, title: "Option 1" },
        { id: 2, title: "Option 2" },
        { id: 3, title: "Option 3" },
      ];
      return { val1, val2, val3, val4, val5, opts };
    },
    template: `
      <div class="tw-grid tw-grid-cols-2 tw-gap-8 tw-max-w-3xl tw-pb-8">
        <VcSelect v-model="val1" label="Default" placeholder="Select..." :options="opts" optionValue="id" optionLabel="title" />
        <VcSelect v-model="val2" label="With Value" :options="opts" optionValue="id" optionLabel="title" />
        <VcSelect v-model="val3" label="Error" placeholder="Select..." :options="opts" optionValue="id" optionLabel="title" :error="true" errorMessage="This field is required" />
        <VcSelect v-model="val4" label="Disabled" :options="opts" optionValue="id" optionLabel="title" :disabled="true" />
        <VcSelect v-model="val5" label="Loading" placeholder="Loading..." :options="opts" optionValue="id" optionLabel="title" :loading="true" />
        <VcSelect v-model="val3" label="With Hint" placeholder="Select..." :options="opts" optionValue="id" optionLabel="title" hint="Pick one option from the list" />
      </div>
    `,
  }),
};

/**
 * Comparing default and small sizes side by side.
 */
export const AllSizes: Story = {
  render: () => ({
    components: { VcSelect },
    setup() {
      const val1 = ref(1);
      const val2 = ref(1);
      const opts = [
        { id: 1, title: "Option 1" },
        { id: 2, title: "Option 2" },
        { id: 3, title: "Option 3" },
      ];
      return { val1, val2, opts };
    },
    template: `
      <div class="tw-flex tw-gap-8 tw-items-start tw-max-w-3xl">
        <div class="tw-flex-1">
          <VcSelect v-model="val1" label="Default size" :options="opts" optionValue="id" optionLabel="title" size="default" />
        </div>
        <div class="tw-flex-1">
          <VcSelect v-model="val2" label="Small size" :options="opts" optionValue="id" optionLabel="title" size="small" />
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstrates accessibility features: auto-generated IDs, aria-describedby, aria-invalid.
 * Inspect the DOM to see the ARIA attributes linking label, input, hint, and error elements.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { VcSelect },
    setup() {
      const val1 = ref(null);
      const val2 = ref(null);
      const opts = [
        { id: 1, title: "Option 1" },
        { id: 2, title: "Option 2" },
        { id: 3, title: "Option 3" },
      ];
      return { val1, val2, opts };
    },
    template: `
      <div class="tw-space-y-8 tw-max-w-lg">
        <div>
          <h3 class="tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-600">With hint (inspect: aria-describedby → hint id)</h3>
          <VcSelect v-model="val1" label="Category" placeholder="Select category..." :options="opts" optionValue="id" optionLabel="title" hint="Choose the main product category" />
        </div>
        <div>
          <h3 class="tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-600">With error (inspect: aria-invalid + aria-describedby → error id)</h3>
          <VcSelect v-model="val2" label="Status" placeholder="Select status..." :options="opts" optionValue="id" optionLabel="title" :error="true" errorMessage="Status is required" />
        </div>
      </div>
    `,
  }),
};

/**
 * When the dropdown has many options, scroll arrow buttons appear at the top and bottom
 * of the list. Hovering over them continuously scrolls the content in that direction.
 */
export const Scrollable: Story = {
  args: {
    label: "Timezone",
    placeholder: "Select a timezone",
    clearable: true,
    options: [
      { id: "est", title: "Eastern Standard Time (EST)" },
      { id: "cst", title: "Central Standard Time (CST)" },
      { id: "mst", title: "Mountain Standard Time (MST)" },
      { id: "pst", title: "Pacific Standard Time (PST)" },
      { id: "akst", title: "Alaska Standard Time (AKST)" },
      { id: "hst", title: "Hawaii Standard Time (HST)" },
      { id: "gmt", title: "Greenwich Mean Time (GMT)" },
      { id: "cet", title: "Central European Time (CET)" },
      { id: "eet", title: "Eastern European Time (EET)" },
      { id: "ist", title: "India Standard Time (IST)" },
      { id: "cst_cn", title: "China Standard Time (CST)" },
      { id: "jst", title: "Japan Standard Time (JST)" },
      { id: "kst", title: "Korea Standard Time (KST)" },
      { id: "aest", title: "Australian Eastern Standard Time (AEST)" },
      { id: "nzst", title: "New Zealand Standard Time (NZST)" },
      { id: "brt", title: "Brasilia Time (BRT)" },
      { id: "art", title: "Argentina Time (ART)" },
      { id: "cat", title: "Central Africa Time (CAT)" },
      { id: "eat", title: "East Africa Time (EAT)" },
      { id: "wet", title: "Western European Time (WET)" },
    ],
    optionValue: "id",
    optionLabel: "title",
  },
  render: (args) => ({
    components: { VcSelect },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: `
      <div class="tw-p-4 tw-max-w-sm">
        <VcSelect
          v-bind="args"
          v-model="value"
        />
        <div class="tw-mt-4 tw-text-sm">
          <p>Selected: <code>{{ value ?? 'none' }}</code></p>
        </div>
      </div>
    `,
  }),
};
