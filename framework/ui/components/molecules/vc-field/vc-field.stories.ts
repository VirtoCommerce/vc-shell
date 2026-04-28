import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcField from "@ui/components/molecules/vc-field/vc-field.vue";
import { provide, ref } from "vue";
import { BladeLoadingKey } from "@framework/injection-keys";

const TYPE = ["text", "date", "date-ago", "link", "email"];
const ORIENTATION = ["vertical", "horizontal"];

/**
 * `VcField` is a component used to display labeled information, supporting various content types and layouts.
 */
const meta = {
  title: "Form/VcField",
  component: VcField,
  tags: ["autodocs"],
  args: {
    label: "Field Label",
    tooltip: "Field Tooltip",
    type: "text",
    modelValue: "Field Value",
    orientation: "vertical",
    aspectRatio: [1, 1],
  },
  argTypes: {
    label: {
      description: "Field label text",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    tooltip: {
      description: "Field tooltip information that appears on hover",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    type: {
      description: "Type of field content to display",
      control: "radio",
      options: TYPE,
      table: {
        type: { summary: TYPE.join(" | ") },
        defaultValue: { summary: "text" },
      },
    },
    modelValue: {
      description: "Content to display in the field",
      control: "text",
      table: {
        type: { summary: "string | Date | any" },
      },
    },
    copyable: {
      description: "Add a copy button for field content",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    orientation: {
      description: "Layout orientation of the field",
      control: "radio",
      options: ORIENTATION,
      table: {
        type: { summary: ORIENTATION.join(" | ") },
        defaultValue: { summary: "vertical" },
      },
    },
    aspectRatio: {
      description: "Column width ratio for label and value when in horizontal orientation",
      control: "object",
      table: {
        type: { summary: "[number, number]" },
        defaultValue: { summary: "[1, 1]" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcField component is used to display labeled read-only information in various formats:

- Plain text
- Formatted dates
- Relative time (date ago)
- Clickable links
- Email addresses with mailto links

It supports both vertical and horizontal layouts with customizable aspect ratios for flexible UI design.
        `,
      },
    },
  },
} satisfies Meta<typeof VcField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text field in vertical orientation
 */
export const Default: Story = {
  args: {
    type: "text",
    modelValue: "Field Value",
  },
};

/**
 * Field displaying a formatted date
 */
export const DateType: Story = {
  args: {
    type: "date",
    modelValue: new Date(),
  },
};

/**
 * Field displaying a relative time (e.g., "2 days ago")
 */
export const DateAgo: Story = {
  args: {
    type: "date-ago",
    modelValue: new Date(),
  },
};

/**
 * Field displaying a clickable link
 */
export const Link: Story = {
  args: {
    type: "link",
    modelValue: "https://virtocommerce.com/",
  },
};

/**
 * Link field with a copy button
 */
export const LinkCopyable: Story = {
  args: {
    type: "link",
    modelValue: "https://virtocommerce.com/",
    copyable: true,
  },
};

/**
 * Field displaying an email address with a mailto link
 */
export const Email: Story = {
  args: {
    type: "email",
    modelValue: "email@virtocommerce.com",
  },
};

/**
 * Field in horizontal orientation with label beside the value
 */
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
};

/**
 * Horizontal field with custom aspect ratio between label and value
 */
export const HorizontalAspectRatio: Story = {
  args: {
    orientation: "horizontal",
    aspectRatio: [1, 2],
  },
};

/**
 * Horizontal field without a label — value still respects `aspectRatio[1]`,
 * preserving form-grid alignment with sibling fields.
 */
export const HorizontalNoLabel: Story = {
  args: {
    label: undefined,
    orientation: "horizontal",
    aspectRatio: [1, 2],
    modelValue: "Aligned with labeled siblings",
  },
};

/**
 * Field with a copy button. The icon-only button uses `size="icon-sm"`
 * for proper inline sizing alongside the value.
 */
export const Copyable: Story = {
  args: {
    type: "text",
    modelValue: "Click the icon to copy this value",
    copyable: true,
  },
};

/**
 * Email field with a copy button — anchor uses link colors and underlines on hover.
 */
export const EmailCopyable: Story = {
  args: {
    type: "email",
    modelValue: "email@virtocommerce.com",
    copyable: true,
  },
};

/**
 * Skeleton state shown when blade is loading. Uses `provide(BladeLoadingKey, ref(true))`
 * to simulate the blade loading context.
 */
export const Skeleton: Story = {
  args: {
    label: "Status",
  },
  render: (args) => ({
    components: { VcField },
    setup() {
      provide(BladeLoadingKey, ref(true));
      return { args };
    },
    template: '<VcField v-bind="args" />',
  }),
};
