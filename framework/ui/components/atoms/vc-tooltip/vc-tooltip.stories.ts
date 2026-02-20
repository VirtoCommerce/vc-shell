import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcTooltip } from "@ui/components/atoms/vc-tooltip";

/**
 * `VcTooltip` is a component that displays additional information when users hover over or focus an element.
 * It provides contextual help, hints, or explanations without cluttering the interface.
 *
 * Features:
 * - Arrow pointing to trigger element
 * - Smooth fade + scale animation
 * - Three visual variants: default (light), dark, info
 * - Configurable max-width, offset, delay, and placement
 * - Keyboard accessible (focus/blur, Escape to dismiss)
 * - ARIA `role="tooltip"` with `aria-describedby`
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
        defaultValue: { summary: "{ mainAxis: 8, crossAxis: 0 }" },
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
    arrow: {
      description: "Whether to show an arrow pointing to the trigger",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    variant: {
      description: "Visual theme variant",
      control: "select",
      options: ["default", "dark", "info"],
      table: {
        type: { summary: '"default" | "dark" | "info"' },
        defaultValue: { summary: "default" },
      },
    },
    maxWidth: {
      description: "Maximum width of the tooltip (px number or CSS string)",
      control: "text",
      table: {
        type: { summary: "number | string" },
        defaultValue: { summary: "240" },
      },
    },
    disabled: {
      description: "Whether to suppress the tooltip entirely",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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

- Supports 12 placement options (top, right, bottom, left with start/end variations)
- Arrow indicator pointing to the trigger element
- Three visual variants: \`default\` (light), \`dark\`, and \`info\`
- Smooth fade + scale entrance/exit animation
- Configurable display delay to prevent accidental triggering
- Customizable offset and max-width for precise control
- Keyboard accessible — shows on focus, dismisses with Escape
- ARIA compliant with \`role="tooltip"\` and \`aria-describedby\`
- Uses Vue's Teleport for optimal rendering in the DOM
- Leverages Floating UI for accurate positioning with flip and shift
        `,
      },
    },
  },
} satisfies Meta<typeof VcTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const triggerButtonClass = "tw-px-4 tw-py-2 tw-bg-primary-500 tw-text-white tw-rounded-md tw-text-sm tw-font-medium tw-cursor-pointer tw-border-none hover:tw-bg-primary-600 tw-transition-colors";

/**
 * Basic tooltip with arrow — the default experience.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <vc-tooltip v-bind="args">
          <button :class="triggerButtonClass">
            Hover me
          </button>
          <template #tooltip>
            This is a tooltip with an arrow
          </template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Three visual variants for different contexts.
 */
export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Use `variant` to switch between light (default), dark, and info themes.",
      },
    },
  },
  render: () => ({
    components: { VcTooltip },
    setup() {
      return { triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-gap-8 tw-h-40">
        <vc-tooltip placement="top" variant="default">
          <button :class="triggerButtonClass">Default</button>
          <template #tooltip>Light tooltip — clean and subtle</template>
        </vc-tooltip>

        <vc-tooltip placement="top" variant="dark">
          <button :class="triggerButtonClass">Dark</button>
          <template #tooltip>Dark tooltip — high contrast</template>
        </vc-tooltip>

        <vc-tooltip placement="top" variant="info">
          <button :class="triggerButtonClass">Info</button>
          <template #tooltip>Info tooltip — draws attention</template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Tooltip without arrow — for a cleaner minimal look.
 */
export const NoArrow: Story = {
  args: {
    arrow: false,
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <vc-tooltip v-bind="args">
          <button :class="triggerButtonClass">No arrow</button>
          <template #tooltip>A clean tooltip without the arrow indicator</template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Tooltip with a delayed appearance.
 */
export const WithDelay: Story = {
  args: {
    delay: 500,
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <vc-tooltip v-bind="args">
          <button :class="triggerButtonClass">
            Hover me (500ms delay)
          </button>
          <template #tooltip>This tooltip appears after a delay</template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * All 12 placement options.
 */
export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tooltips can be positioned in 12 ways relative to the trigger. Floating UI automatically flips when near viewport edges.",
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
      const btnClass = "tw-px-3 tw-py-1.5 tw-bg-neutrals-100 tw-text-neutrals-700 tw-rounded-md tw-text-xs tw-font-medium tw-cursor-pointer tw-border tw-border-solid tw-border-neutrals-200 hover:tw-bg-neutrals-200 tw-transition-colors";
      return { placements, btnClass };
    },
    template: `
      <div class="tw-grid tw-grid-cols-3 tw-gap-6 tw-p-16">
        <div v-for="placement in placements" :key="placement" class="tw-flex tw-justify-center tw-items-center tw-h-24">
          <vc-tooltip :placement="placement" variant="dark">
            <button :class="btnClass">
              {{ placement }}
            </button>
            <template #tooltip>Placement: {{ placement }}</template>
          </vc-tooltip>
        </div>
      </div>
    `,
  }),
};

/**
 * Tooltip with custom offset.
 */
export const WithOffset: Story = {
  args: {
    offset: { mainAxis: 20, crossAxis: 0 },
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <vc-tooltip v-bind="args">
          <button :class="triggerButtonClass">
            Large offset (20px)
          </button>
          <template #tooltip>This tooltip has extra spacing from the trigger</template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Rich HTML content inside the tooltip.
 */
export const RichContent: Story = {
  args: {
    maxWidth: 280,
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-48">
        <vc-tooltip v-bind="args" placement="top">
          <button :class="triggerButtonClass">
            Help
          </button>
          <template #tooltip>
            <div>
              <div class="tw-font-semibold tw-mb-1 tw-text-neutrals-900">Need help?</div>
              <p class="tw-mb-1.5 tw-text-neutrals-500">Here are some helpful tips:</p>
              <ul class="tw-list-disc tw-pl-4 tw-text-neutrals-600 tw-space-y-0.5">
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
 * Disabled tooltip — hover triggers no popup.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcTooltip },
    setup() {
      return { args, triggerButtonClass };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <vc-tooltip v-bind="args">
          <button :class="triggerButtonClass">
            Tooltip disabled
          </button>
          <template #tooltip>You won't see this</template>
        </vc-tooltip>
      </div>
    `,
  }),
};

/**
 * Interactive icon toolbar with tooltips — a realistic usage pattern.
 */
export const IconToolbar: Story = {
  render: () => ({
    components: { VcTooltip },
    setup() {
      const actions = [
        { icon: "\u2795", label: "Add item" },
        { icon: "\u270F\uFE0F", label: "Edit selected" },
        { icon: "\uD83D\uDDD1\uFE0F", label: "Delete" },
        { icon: "\u2699\uFE0F", label: "Settings" },
      ];
      return { actions };
    },
    template: `
      <div class="tw-flex tw-justify-center tw-items-center tw-h-40">
        <div class="tw-flex tw-items-center tw-gap-1 tw-bg-neutrals-50 tw-p-2 tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200">
          <vc-tooltip
            v-for="action in actions"
            :key="action.label"
            placement="top"
            variant="dark"
          >
            <button class="tw-w-9 tw-h-9 tw-flex tw-items-center tw-justify-center tw-rounded-md tw-cursor-pointer tw-border-none tw-bg-transparent hover:tw-bg-neutrals-200 tw-transition-colors tw-text-base">
              {{ action.icon }}
            </button>
            <template #tooltip>{{ action.label }}</template>
          </vc-tooltip>
        </div>
      </div>
    `,
  }),
};
