import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcSkeleton from "@ui/components/atoms/vc-skeleton/vc-skeleton.vue";

/**
 * `VcSkeleton` component is used to display loading placeholders for content.
 * It helps improve UX by showing preliminary placeholders where content is loading.
 */
const meta = {
  title: "Layout/VcSkeleton",
  component: VcSkeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circle", "block"],
      description: "Shape variant: text rows, circle, or rectangular block",
      table: {
        type: { summary: '"text" | "circle" | "block"' },
        defaultValue: { summary: '"text"' },
      },
    },
    rows: {
      control: { type: "number", min: 1, max: 20 },
      description: "Number of skeleton rows (only for variant='text')",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    width: {
      control: "text",
      description: "Custom width (number → px, string → as-is). For circle/block variants.",
      table: {
        type: { summary: "string | number" },
      },
    },
    height: {
      control: "text",
      description: "Custom height (number → px, string → as-is). For circle/block variants.",
      table: {
        type: { summary: "string | number" },
      },
    },
    animated: {
      control: "boolean",
      description: "Enables pulse animation",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
  args: {
    variant: "text",
    rows: 1,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcSkeleton component is used to display loading placeholders with support for:

- Pulse animation for visual loading indication
- Customizable number of rows for paragraph imitation
- Last row is displayed with 60% width for a more natural look

## Usage Examples

\`\`\`vue
<!-- Simple skeleton with a single row -->
<vc-skeleton />

<!-- Skeleton for loading paragraph text -->
<vc-skeleton :rows="3" />

<!-- Skeleton with animation -->
<vc-skeleton :rows="3" animated />

<!-- Creating more complex templates with CSS -->
<div class="card">
  <div class="card-img tw-h-40 tw-bg-[--neutrals-200] tw-rounded-md tw-mb-4"></div>
  <div class="card-body">
    <div class="tw-h-6 tw-bg-[--neutrals-200] tw-rounded tw-w-2/3 tw-mb-4"></div>
    <vc-skeleton :rows="3" animated />
  </div>
</div>
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof VcSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Standard skeleton with a single row and pulse animation.
 */
export const Default: Story = {
  args: {},
};

/**
 * Skeleton with pulse animation, creating a wave effect for loading indication.
 */
export const Animated: Story = {
  args: {
    animated: true,
  },
};

/**
 * Skeleton with multiple rows to imitate a paragraph of text.
 */
export const MultipleRows: Story = {
  args: {
    rows: 5,
  },
};

/**
 * Customized skeleton for imitating a card with image and text.
 */
export const CardSkeleton: Story = {
  render: (args) => ({
    components: { VcSkeleton },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-border tw-rounded-lg tw-overflow-hidden tw-shadow-sm">
        <div class="tw-h-[200px] tw-bg-[--neutrals-200]"></div>
        <div class="tw-p-4">
          <div class="tw-h-5 tw-bg-[--neutrals-200] tw-rounded tw-w-3/5 tw-mb-2"></div>
          <vc-skeleton :rows="3" animated />
          <div class="tw-flex tw-gap-2 tw-mt-4">
            <div class="tw-h-8 tw-w-20 tw-bg-[--neutrals-200] tw-rounded-md"></div>
            <div class="tw-h-8 tw-w-20 tw-bg-[--neutrals-200] tw-rounded-md"></div>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Loading list with items imitation.
 */
export const ListSkeleton: Story = {
  render: (args) => ({
    components: { VcSkeleton },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-space-y-4">
        <div v-for="i in 3" :key="i" class="tw-flex tw-gap-4 tw-items-center">
          <div class="tw-w-12 tw-h-12 tw-bg-[--neutrals-200] tw-rounded-full"></div>
          <div class="tw-flex-1">
            <div class="tw-h-4 tw-bg-[--neutrals-200] tw-rounded tw-w-2/5 tw-mb-2"></div>
            <vc-skeleton :rows="1" animated />
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Circle variant — useful for avatar or icon placeholders.
 */
export const Circle: Story = {
  args: {
    variant: "circle",
    width: 48,
    height: 48,
  },
};

/**
 * Block variant — rectangular placeholder with custom dimensions.
 * Great for buttons, titles, images.
 */
export const Block: Story = {
  args: {
    variant: "block",
    width: "200px",
    height: "32px",
  },
};

/**
 * Different skeleton shapes composed using variant, width, and height props.
 */
export const CustomShapes: Story = {
  render: (args) => ({
    components: { VcSkeleton },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-flex tw-flex-wrap tw-gap-6 tw-items-center">
        <vc-skeleton variant="circle" :width="100" :height="100" />
        <vc-skeleton variant="block" :width="100" :height="100" />
        <vc-skeleton variant="block" width="150px" height="60px" />
        <vc-skeleton variant="block" width="200px" height="20px" />
      </div>
    `,
  }),
};

/**
 * Blade-like skeleton layout combining all variants.
 */
export const BladeSkeletonExample: Story = {
  render: (args) => ({
    components: { VcSkeleton },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-border tw-rounded-lg tw-overflow-hidden tw-w-[500px]">
        <!-- Header skeleton -->
        <div class="tw-flex tw-items-center tw-gap-3 tw-px-6 tw-py-4 tw-border-b">
          <vc-skeleton variant="circle" :width="24" :height="24" />
          <div class="tw-flex-1 tw-flex tw-flex-col tw-gap-1">
            <vc-skeleton variant="block" width="40%" height="16px" />
            <vc-skeleton variant="block" width="25%" height="12px" />
          </div>
        </div>
        <!-- Toolbar skeleton -->
        <div class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-border-b tw-bg-[--neutrals-50]">
          <vc-skeleton variant="block" :width="60" :height="32" />
          <vc-skeleton variant="block" :width="60" :height="32" />
          <vc-skeleton variant="block" :width="60" :height="32" />
        </div>
        <!-- Content skeleton -->
        <div class="tw-p-6">
          <vc-skeleton :rows="6" animated />
        </div>
      </div>
    `,
  }),
};
