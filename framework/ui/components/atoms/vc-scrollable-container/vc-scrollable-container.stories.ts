import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcScrollableContainer } from "@ui/components/atoms/vc-scrollable-container";

/**
 * `VcScrollableContainer` provides a scrollable viewport with arrow indicators
 * that appear when content overflows. Arrows respond to pointer-hover for
 * continuous scrolling and to keyboard Up/Down for step-based navigation.
 *
 * - Scroll arrows auto-hide when there is no overflow
 * - Customizable scroll speed via `speed` prop (captured once at mount)
 * - Slots for custom arrow icons (`arrow-up`, `arrow-down`)
 * - Accessible: `role="region"`, keyboard navigation with Up/Down arrows
 */
const meta = {
  title: "Atoms/VcScrollableContainer",
  component: VcScrollableContainer,
  tags: ["autodocs"],
  argTypes: {
    speed: {
      description:
        "Scroll speed in pixels per animation frame. Captured once at mount and not reactive afterward.",
      control: { type: "number", min: 1, max: 20, step: 1 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "2" },
      },
    },
    default: {
      description: "Content to render inside the scrollable viewport",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
    "arrow-up": {
      description: "Custom arrow-up indicator (replaces default chevron icon)",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
    "arrow-down": {
      description: "Custom arrow-down indicator (replaces default chevron icon)",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  args: {
    speed: undefined,
  },
  parameters: {
    docs: {
      description: {
        component: `
A container that wraps overflowing content with arrow-based scroll indicators.

Arrows appear automatically when the content overflows the viewport and hide when
content fits. Hovering an arrow scrolls continuously; pressing Up/Down keys
scrolls in discrete steps.

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| \`--scroll-arrow-size\` | \`16px\` | Arrow icon font-size |
| \`--scroll-arrow-color\` | \`var(--neutrals-400)\` | Arrow icon color |

## Usage

\`\`\`vue
<VcScrollableContainer :speed="4" style="height: 200px;">
  <div v-for="i in 30" :key="i">Item {{ i }}</div>
</VcScrollableContainer>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcScrollableContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default usage with enough items to trigger overflow.
 * Hover over the top/bottom arrows to scroll, or focus the viewport and use keyboard arrows.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcScrollableContainer },
    setup() {
      const items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);
      return { args, items };
    },
    template: `
      <div style="height: 250px; width: 300px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <VcScrollableContainer v-bind="args">
          <div
            v-for="item in items"
            :key="item"
            class="tw-px-3 tw-py-2 tw-text-sm tw-border-b tw-border-[var(--neutrals-100)]"
          >
            {{ item }}
          </div>
        </VcScrollableContainer>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "A list of 30 items inside a fixed-height container. Scroll arrows appear at the top and bottom edges when content overflows. Hover an arrow to scroll continuously.",
      },
    },
  },
};

/**
 * When content fits within the viewport, no scroll arrows are shown.
 */
export const NoOverflow: Story = {
  render: (args) => ({
    components: { VcScrollableContainer },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 250px; width: 300px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <VcScrollableContainer v-bind="args">
          <div class="tw-px-3 tw-py-2 tw-text-sm">
            Only one item -- no overflow, no arrows.
          </div>
        </VcScrollableContainer>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When the content fits entirely within the container, both scroll arrows are hidden. The component behaves as a plain wrapper with no visual indicators.",
      },
    },
  },
};

/**
 * Higher `speed` value makes hover-scrolling faster.
 * The `speed` prop is captured once at mount and is not reactive after that.
 */
export const CustomSpeed: Story = {
  args: {
    speed: 10,
  },
  render: (args) => ({
    components: { VcScrollableContainer },
    setup() {
      const items = Array.from({ length: 30 }, (_, i) => `Fast-scroll item ${i + 1}`);
      return { args, items };
    },
    template: `
      <div class="tw-flex tw-gap-6">
        <div>
          <p class="tw-text-xs tw-font-medium tw-mb-2 tw-text-[var(--neutrals-600)]">speed: 10 (fast)</p>
          <div style="height: 250px; width: 260px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <VcScrollableContainer v-bind="args">
              <div
                v-for="item in items"
                :key="item"
                class="tw-px-3 tw-py-2 tw-text-sm tw-border-b tw-border-[var(--neutrals-100)]"
              >
                {{ item }}
              </div>
            </VcScrollableContainer>
          </div>
        </div>
        <div>
          <p class="tw-text-xs tw-font-medium tw-mb-2 tw-text-[var(--neutrals-600)]">speed: 2 (default)</p>
          <div style="height: 250px; width: 260px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <VcScrollableContainer>
              <div
                v-for="item in items"
                :key="item"
                class="tw-px-3 tw-py-2 tw-text-sm tw-border-b tw-border-[var(--neutrals-100)]"
              >
                {{ item }}
              </div>
            </VcScrollableContainer>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison of a fast scroll speed (10) versus the default (2). Hover over each container's arrows to feel the difference. Note: `speed` is captured at mount time and cannot be changed reactively.",
      },
    },
  },
};
