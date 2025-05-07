import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3";
import { VcWidget } from "./";
import { provideWidgetService } from "../../../../core/composables";

/**
 * `VcWidget` is a component that represents a clickable widget with an icon, title, and optional badge.
 * It's commonly used in dashboards, sidebars, and navigation elements.
 */
const meta = {
  title: "Atoms/VcWidget",
  component: VcWidget,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        provideWidgetService();
      },
      template: `
      <div>
        <story />
      </div>
    `,
    }),
  ],
  argTypes: {
    icon: {
      description: "Icon to display in the widget (Font Awesome format or component name)",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    title: {
      description: "Title text displayed below the icon",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    value: {
      description: "Value to display as a badge count (truncated at 99+)",
      control: "number",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "undefined" },
      },
    },
    disabled: {
      description: "Whether the widget is disabled",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    isExpanded: {
      description: "Whether the widget is expanded",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    horizontal: {
      description: "Whether to arrange the widget horizontally",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    icon: "material-save",
    title: "Saved",
    value: 12,
    disabled: false,
    isExpanded: false,
    horizontal: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcWidget component represents an interactive widget with the following features:

- Icon display with support for Font Awesome icons
- Optional title text
- Badge counter with automatic truncation of large numbers (99+)
- Support for disabled state
- Expanded/collapsed states
- Can be arranged horizontally or vertically
- Emits click events for interaction handling
        `,
      },
    },
  },
} satisfies Meta<typeof VcWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default widget with icon, title and badge count
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" @click="onClick" />
      </div>
    `,
    methods: {
      onClick() {
        console.log("Widget clicked");
      },
    },
  }),
};

/**
 * Horizontal layout with icon and title side by side
 */
export const Horizontal: Story = {
  args: {
    horizontal: true,
  },
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" @click="onClick" />
      </div>
    `,
    methods: {
      onClick() {
        console.log("Horizontal widget clicked");
      },
    },
  }),
};

/**
 * Widget in disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Widget with a large badge count (shows truncation)
 */
export const LargeBadgeCount: Story = {
  args: {
    value: 120,
  },
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" @click="onClick" />
      </div>
    `,
    methods: {
      onClick() {
        console.log("Widget with large badge clicked");
      },
    },
  }),
};

/**
 * Widget in expanded state
 */
export const Expanded: Story = {
  args: {
    isExpanded: true,
  },
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" @click="onClick" />
      </div>
    `,
    methods: {
      onClick() {
        console.log("Expanded widget clicked");
      },
    },
  }),
};

/**
 * Widget with different icon
 */
export const DifferentIcon: Story = {
  args: {
    icon: "fas fa-bell",
    title: "Notifications",
    value: 5,
  },
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-block">
        <vc-widget v-bind="args" @click="onClick" />
      </div>
    `,
    methods: {
      onClick() {
        console.log("Notification widget clicked");
      },
    },
  }),
};

/**
 * Multiple widgets arranged in a sidebar layout
 */
export const SidebarLayout: Story = {
  render: () => ({
    components: { VcWidget },
    setup() {
      const widgets = [
        { icon: "fas fa-home", title: "Dashboard", value: null },
        { icon: "fas fa-envelope", title: "Messages", value: 3 },
        { icon: "fas fa-bell", title: "Notifications", value: 12 },
        { icon: "fas fa-user", title: "Profile", value: null },
        { icon: "fas fa-cog", title: "Settings", value: 1 },
      ];

      return { widgets };
    },
    template: `
      <div class="tw-bg-gray-100 tw-p-4 tw-inline-flex tw-flex-col tw-gap-4">
        <vc-widget
          v-for="(widget, index) in widgets"
          :key="index"
          :icon="widget.icon"
          :title="widget.title"
          :value="widget.value"
          @click="() => onClick(widget)"
        />
      </div>
    `,
    methods: {
      onClick(widget: { icon: string; title: string; value: number | null }) {
        console.log(`Widget ${widget.title} clicked`);
      },
    },
  }),
};
