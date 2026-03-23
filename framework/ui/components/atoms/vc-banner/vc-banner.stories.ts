import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcBanner } from "@ui/components/atoms/vc-banner";
import { VcIcon } from "@ui/components/atoms/vc-icon";

/**
 * `VcBanner` is a contextual alert component for displaying important messages.
 * Inspired by shadcn Alert — clean borders, subtle semantic backgrounds, refined typography.
 *
 * Supports 4 variants: `info`, `warning`, `danger`, `success`.
 * Long content is automatically collapsible via the `useCollapsible` composable.
 */
const meta = {
  title: "Action/VcBanner",
  component: VcBanner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      description: "Semantic color variant",
      control: "select",
      options: ["info", "warning", "danger", "success"],
      table: {
        type: { summary: '"info" | "warning" | "danger" | "success"' },
        defaultValue: { summary: "info" },
      },
    },
    icon: {
      description: "Icon identifier (e.g. `lucide-info`, `lucide-triangle-alert`)",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    iconSize: {
      description: "Size of the icon",
      control: "select",
      options: ["xs", "s", "m", "l", "xl", "xxl"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "l" },
      },
    },
    collapsedHeight: {
      description: "Max height in px before content becomes collapsible",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "100" },
      },
    },
    title: {
      description: "Title slot content",
      control: "text",
      table: {
        category: "slots",
        type: { summary: "VNode | string" },
      },
    },
    default: {
      description: "Description / body content",
      control: "text",
      table: {
        category: "slots",
        type: { summary: "VNode | string" },
      },
    },
  },
  args: {
    variant: "info",
    icon: "lucide-info",
    iconSize: "l",
  },
  parameters: {
    docs: {
      description: {
        component: `
A contextual alert banner for displaying status messages, warnings, and informational content.

Features:
- 4 semantic variants with distinct color palettes
- Optional icon with configurable size
- Title + description layout via slots
- Auto-collapsible content when it exceeds \`collapsedHeight\` (default: 100px)
- Customizable trigger slot for expand/collapse control
        `,
      },
    },
  },
} satisfies Meta<typeof VcBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default info banner with icon and description
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args">
        <template #title>Heads up!</template>
        You can add components to your app using the CLI.
      </vc-banner>
    `,
  }),
};

/**
 * All four semantic variants displayed together
 */
export const AllVariants: Story = {
  render: () => ({
    components: { VcBanner },
    setup() {
      const variants = [
        {
          variant: "info",
          icon: "lucide-info",
          title: "Information",
          text: "This is an informational message for the user.",
        },
        {
          variant: "success",
          icon: "lucide-circle-check",
          title: "Success",
          text: "The operation completed successfully.",
        },
        {
          variant: "warning",
          icon: "lucide-triangle-alert",
          title: "Warning",
          text: "Please review before proceeding with this action.",
        },
        {
          variant: "danger",
          icon: "lucide-circle-alert",
          title: "Error",
          text: "Something went wrong. Please try again later.",
        },
      ] as const;
      return { variants };
    },
    template: `
      <div class="tw-space-y-3 tw-max-w-lg">
        <vc-banner
          v-for="v in variants"
          :key="v.variant"
          :variant="v.variant"
          :icon="v.icon"
        >
          <template #title>{{ v.title }}</template>
          {{ v.text }}
        </vc-banner>
      </div>
    `,
  }),
};

/**
 * Banner with title only (no description)
 */
export const TitleOnly: Story = {
  args: {
    variant: "warning",
    icon: "lucide-triangle-alert",
  },
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args" class="tw-max-w-lg">
        <template #title>This action cannot be undone.</template>
      </vc-banner>
    `,
  }),
};

/**
 * Banner with description only (no title)
 */
export const DescriptionOnly: Story = {
  args: {
    variant: "success",
    icon: "lucide-circle-check",
  },
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args" class="tw-max-w-lg">
        Your changes have been saved successfully.
      </vc-banner>
    `,
  }),
};

/**
 * Banner without icon — minimal style
 */
export const NoIcon: Story = {
  args: {
    variant: "info",
    icon: undefined,
  },
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args" class="tw-max-w-lg">
        <template #title>Note</template>
        You can customize this banner by providing an icon prop.
      </vc-banner>
    `,
  }),
};

/**
 * Danger banner for decline/error reasons (matches ProductDetailsBase usage)
 */
export const DeclineReason: Story = {
  args: {
    variant: "danger",
    icon: "lucide-circle-alert",
    iconSize: "l",
    iconVariant: "danger",
  },
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args" class="tw-max-w-lg">
        <template #title>Decline Reason</template>
        Product does not meet the quality standards. Please review the images and description, then resubmit for approval.
      </vc-banner>
    `,
  }),
};

/**
 * Long content that triggers the collapsible behavior
 */
export const CollapsibleContent: Story = {
  args: {
    variant: "danger",
    icon: "lucide-circle-alert",
    collapsedHeight: 60,
  },
  render: (args) => ({
    components: { VcBanner },
    setup() {
      return { args };
    },
    template: `
      <vc-banner v-bind="args" class="tw-max-w-lg">
        <template #title>Error Details</template>
        <p>The following validation errors were found during processing:</p>
        <ul class="tw-list-disc tw-pl-4 tw-mt-1 tw-space-y-1">
          <li>Product SKU is required and must be unique</li>
          <li>Price must be a positive number greater than zero</li>
          <li>At least one product image is required for listing</li>
          <li>Product description must be at least 50 characters long</li>
          <li>Category selection is mandatory for marketplace placement</li>
          <li>Weight and dimensions are required for shipping calculation</li>
        </ul>
      </vc-banner>
    `,
  }),
};
