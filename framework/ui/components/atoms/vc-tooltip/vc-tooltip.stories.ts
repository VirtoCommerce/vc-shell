import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3";
import { VcTooltip } from "./";

/**
 * `VcTooltip` is a component that displays additional information when users hover over an element.
 * It provides contextual help, hints, or explanations without cluttering the interface.
 */
const meta = {
  title: "Atoms/VcTooltip",
  component: VcTooltip,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      description: "Position of the tooltip relative to the target element",
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "bottom" },
      },
    },
    offset: {
      description: "Offset distance from the target element",
      control: "object",
      table: {
        type: { summary: "{ mainAxis?: number; crossAxis?: number }" },
        defaultValue: { summary: "{ mainAxis: 0, crossAxis: 0 }" },
      },
    },
    delay: {
      description: "Delay in milliseconds before displaying the tooltip",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    default: {
      description: "Content that triggers the tooltip on hover",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
    tooltip: {
      description: "Content displayed inside the tooltip",
      control: "text",
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
The VcTooltip component is a versatile UI element for displaying contextual information:

- Supports multiple placement options (top, right, bottom, left with start/end variations)
- Configurable display delay to prevent accidental triggering
- Customizable offset for precise positioning
- Uses Vue's Teleport for optimal rendering in the DOM
- Leverages Floating UI for accurate positioning

**Note:** This component requires an element with id="app" to exist in the DOM for teleportation
of tooltip content. The stories handle this automatically.
        `,
      },
    },
  },
} satisfies Meta<typeof VcTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic example of a tooltip appearing below an element
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-32">
        <vc-tooltip v-bind="args">
          <button class="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded">
            Hover me
          </button>
          <template #tooltip>
            <div class="tw-py-1 tw-px-2">This is a tooltip</div>
          </template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Tooltip with a delayed appearance
 */
export const WithDelay: Story = {
  args: {
    delay: 500,
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-32">
        <vc-tooltip v-bind="args">
          <button class="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded">
            Hover me (500ms delay)
          </button>
          <template #tooltip>
            <div class="tw-py-1 tw-px-2">This tooltip appears after a delay</div>
          </template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Example showing different placement options
 */
export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tooltips can be positioned in various ways relative to the target element.",
      },
    },
  },
  render: () => ({
    components: { VcTooltip },
    setup() {
      const placements = [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ];

      return { placements };
    },
    template: `
      <div class="tw-grid tw-grid-cols-3 tw-gap-4 tw-p-12">
        <div v-for="placement in placements" :key="placement" class="tw-flex tw-justify-center tw-items-center tw-h-24">
          <vc-tooltip :placement="placement">
            <button class="tw-px-3 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded tw-text-sm">
              {{ placement }}
            </button>
            <template #tooltip>
              <div class="tw-py-1 tw-px-2">Placement: {{ placement }}</div>
            </template>
          </vc-tooltip>
        </div>
      </div>
    `,
  }),
};

/**
 * Tooltip with custom offset
 */
export const WithOffset: Story = {
  args: {
    offset: { mainAxis: 16, crossAxis: 0 },
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-32">
        <vc-tooltip v-bind="args">
          <button class="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded">
            Hover me (with offset)
          </button>
          <template #tooltip>
            <div class="tw-py-1 tw-px-2">This tooltip has a custom offset</div>
          </template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Rich content inside tooltip
 */
export const RichContent: Story = {
  render: () => ({
    components: { VcTooltip },
    setup() {
      return {};
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-32">
        <vc-tooltip>
          <button class="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded">
            Help
          </button>
          <template #tooltip>
            <div class="tw-p-2 tw-max-w-xs">
              <h3 class="tw-font-bold tw-mb-1">Need help?</h3>
              <p class="tw-mb-1">Here are some helpful tips:</p>
              <ul class="tw-list-disc tw-pl-4">
                <li>Make sure all fields are filled</li>
                <li>Check for validation errors</li>
                <li>Contact support if issues persist</li>
              </ul>
            </div>
          </template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Interactive example with different triggers and tooltips
 */
export const InteractiveExample: Story = {
  render: () => ({
    components: { VcTooltip },
    setup() {
      const items = [
        { name: "User Profile", icon: "👤", tooltip: "View and edit your profile" },
        { name: "Settings", icon: "⚙️", tooltip: "Configure application settings" },
        { name: "Messages", icon: "✉️", tooltip: "View your messages" },
        { name: "Notifications", icon: "🔔", tooltip: "Manage your notifications" },
      ];

      return { items };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-32">
        <div class="tw-bg-gray-100 tw-p-4 tw-rounded tw-shadow">
          <div class="tw-flex tw-space-x-4">
            <vc-tooltip
              v-for="item in items"
              :key="item.name"
              placement="top"
            >
              <button class="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full tw-shadow-sm tw-text-xl">
                {{ item.icon }}
              </button>
              <template #tooltip>
                <div class="tw-py-1 tw-px-2">{{ item.tooltip }}</div>
              </template>
            </vc-tooltip>
          </div>
        </div>
      </div>
    `,
  }),
};
