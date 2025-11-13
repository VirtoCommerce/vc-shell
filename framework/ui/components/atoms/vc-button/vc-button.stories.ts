import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcButton } from "./";
import { VcIcon } from "../vc-icon";

/**
 * `VcButton` is a versatile UI component used for triggering actions when clicked.
 * It supports multiple variants, states, and can include icons.
 */
const meta = {
  title: "Atoms/VcButton",
  component: VcButton,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Button content text",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "string" },
      },
    },
    icon: {
      description: "Icon to display inside the button (FontAwesome class name or component)",
      control: "text",
      table: {
        type: { summary: "string | Component" },
        defaultValue: { summary: "undefined" },
      },
    },
    iconClass: {
      description: "Additional CSS classes to apply to the icon",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    iconSize: {
      description: "Size of the icon",
      control: "select",
      options: ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
      table: {
        type: { summary: "'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'" },
        defaultValue: { summary: "'s'" },
      },
    },
    variant: {
      description: "Button style variant",
      control: "select",
      options: ["primary", "secondary"],
      table: {
        type: { summary: "'primary' | 'secondary'" },
        defaultValue: { summary: "'primary'" },
      },
    },
    size: {
      description: "Button size",
      control: "select",
      options: ["xs", "sm", "base"],
      table: {
        type: { summary: "'xs' | 'sm' | 'base'" },
        defaultValue: { summary: "'base'" },
      },
    },
    disabled: {
      description: "Whether the button is disabled",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    small: {
      description: "Legacy prop: Whether the button is small (deprecated, use size instead)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    outline: {
      description: "Legacy prop: Whether the button is outlined (deprecated, use variant instead)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      description: "Whether the button appears selected/active",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    text: {
      description: "Whether the button should appear as text only (no background)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    raised: {
      description: "Legacy prop: Whether the button is raised (deprecated, use variant instead)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onClick: {
      description: "Event emitted when the button is clicked",
      action: "clicked",
      table: {
        category: "Events",
        type: { summary: "(event: 'click', value: Event) => void" },
      },
    },
  },
  args: {
    default: "Button Text",
    variant: "primary",
    size: "base",
    iconSize: "s",
  },
} satisfies Meta<typeof VcButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary styling and base size.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Secondary variant with outline styling.
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Small-sized button.
 */
export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Extra-small button.
 */
export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Disabled button state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Selected/active button state.
 */
export const Selected: Story = {
  args: {
    selected: true,
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Text-only button without background.
 */
export const TextOnly: Story = {
  args: {
    text: true,
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Button with an icon.
 */
export const WithIcon: Story = {
  args: {
    icon: "material-add",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Button with a customized icon class.
 */
export const WithCustomIconClass: Story = {
  args: {
    icon: "material-add",
    iconClass: "tw-text-red-500",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Button with a large icon.
 */
export const WithLargeIcon: Story = {
  args: {
    icon: "material-add",
    iconSize: "l",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)">{{args.default}}</VcButton>',
  }),
};

/**
 * Icon-only button without text.
 */
export const IconOnly: Story = {
  args: {
    icon: "material-add",
    default: "",
  },
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<VcButton v-bind="args" @click="(e) => console.log(\'Button clicked\', e)" />',
  }),
};
