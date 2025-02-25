import type { Meta, StoryFn } from "@storybook/vue3";
import VcBadge from "./vc-badge.vue";

export default {
  title: "atoms/VcBadge",
  component: VcBadge,
  args: {
    content: "42",
  },
  argTypes: {
    content: {
      control: "text",
    },
    active: {
      control: "boolean",
      type: {
        name: "boolean",
        required: false,
      },
    },
    disabled: {
      control: "boolean",
      type: {
        name: "boolean",
        required: false,
      },
    },
    clickable: {
      control: "boolean",
      type: {
        name: "boolean",
        required: false,
      },
    },
  },
} satisfies Meta<typeof VcBadge>;

const Template: StoryFn<typeof VcBadge> = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: `<VcBadge v-bind="args"></VcBadge>`,
});

export const Basic = Template.bind({});

export const Active = Template.bind({});
Active.args = { active: true };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Clickable = Template.bind({});
Clickable.args = { clickable: true };
