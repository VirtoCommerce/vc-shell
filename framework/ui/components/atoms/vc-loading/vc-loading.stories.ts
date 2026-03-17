import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcLoading from "@ui/components/atoms/vc-loading/vc-loading.vue";
import { ref } from "vue";

/**
 * `VcLoading` is a lightweight overlay indicator that shows a sweeping progress bar
 * when content is loading. It uses `position: absolute` so the parent container
 * must have `position: relative` to constrain it.
 *
 * - Animated progress bar with configurable colors via CSS custom properties
 * - Accessible: `role="status"`, `aria-busy`, `aria-live="polite"`, sr-only text
 * - Backdrop blur and semi-transparent overlay when active
 */
const meta = {
  title: "Atoms/VcLoading",
  component: VcLoading,
  tags: ["autodocs"],
  argTypes: {
    active: {
      description: "Controls whether the loading overlay is visible",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    active: true,
  },
  parameters: {
    docs: {
      description: {
        component: `
A loading overlay component that displays an animated progress bar over its parent container.

The component uses \`position: absolute\` and requires the parent element to have \`position: relative\`
so the overlay is correctly constrained.

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| \`--loading-bar-color\` | \`var(--primary-500)\` | Progress bar fill color |
| \`--loading-bar-track\` | \`var(--primary-100)\` | Progress bar track color |
| \`--loading-overlay-bg\` | \`rgba(255,255,255,0.6)\` | Overlay background |
| \`--loading-bar-width\` | \`140px\` | Bar width |
| \`--loading-bar-height\` | \`4px\` | Bar height |

## Usage

\`\`\`vue
<div style="position: relative; height: 200px;">
  <VcLoading :active="isLoading" />
  <p>Content behind the overlay</p>
</div>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    () => ({
      template: `
        <div style="position: relative; width: 100%; height: 200px; border: 1px dashed #ccc; border-radius: 8px; overflow: hidden;">
          <story />
          <div class="tw-flex tw-items-center tw-justify-center tw-h-full tw-text-sm tw-text-[var(--neutrals-400)]">
            Content behind the overlay
          </div>
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof VcLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default active state shows the animated progress bar over a semi-transparent backdrop.
 * The parent container must use `position: relative` so the overlay stays contained.
 */
export const Default: Story = {
  args: {
    active: true,
  },
  render: (args) => ({
    components: { VcLoading },
    setup() {
      return { args };
    },
    template: `<VcLoading v-bind="args" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The loading indicator in its active state. An animated bar sweeps across a track while a blurred overlay dims the content beneath.",
      },
    },
  },
};

/**
 * When `active` is `false`, the overlay is hidden (`display: none`) and does not
 * interfere with the content underneath.
 */
export const Inactive: Story = {
  args: {
    active: false,
  },
  render: (args) => ({
    components: { VcLoading },
    setup() {
      return { args };
    },
    template: `<VcLoading v-bind="args" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When inactive, the overlay is completely hidden. The content beneath is fully visible and interactive.",
      },
    },
  },
};

/**
 * Interactive demo: click the button to simulate an async operation.
 * The loading overlay activates for 2 seconds, then deactivates.
 */
export const Interactive: Story = {
  args: {
    active: false,
  },
  decorators: [
    () => ({
      template: `<story />`,
    }),
  ],
  render: (args) => ({
    components: { VcLoading },
    setup() {
      const isLoading = ref(false);

      function simulateLoad() {
        isLoading.value = true;
        setTimeout(() => {
          isLoading.value = false;
        }, 2000);
      }

      return { args, isLoading, simulateLoad };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <button
          class="tw-px-4 tw-py-2 tw-rounded tw-bg-[var(--primary-500)] tw-text-white tw-text-sm tw-w-fit tw-cursor-pointer"
          :disabled="isLoading"
          @click="simulateLoad"
        >
          {{ isLoading ? 'Loading...' : 'Simulate Load (2s)' }}
        </button>
        <div style="position: relative; width: 100%; height: 200px; border: 1px dashed #ccc; border-radius: 8px; overflow: hidden;">
          <VcLoading :active="isLoading" />
          <div class="tw-flex tw-items-center tw-justify-center tw-h-full tw-text-sm tw-text-[var(--neutrals-400)]">
            Content behind the overlay
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Click the button to toggle the loading state on for 2 seconds. This demonstrates a typical async-operation pattern where content is overlaid during data fetching.",
      },
    },
  },
};
