import { StoryFn, Meta } from "@storybook/vue3";
import VcField from "./vc-field.vue";

const TYPE = ["text", "date", "date-ago", "link", "email"];
const ORIENTATION = ["vertical", "horizontal"];

export default {
  title: "molecules/VcField",
  component: VcField,
  args: {
    label: "Field Label",
    tooltip: "Field Tooltip",
    type: "text",
    modelValue: "Field Value",
    orientation: "vertical",
    aspectRatio: [1, 1],
  },
  argTypes: {
    type: {
      control: "radio",

      options: TYPE,
      table: {
        type: {
          summary: TYPE.join(" | "),
        },
      },
    },
    orientation: {
      control: "radio",
      options: ORIENTATION,
      table: {
        type: {
          summary: ORIENTATION.join(" | "),
        },
      },
    },
    aspectRatio: {
      control: "object",
      table: {
        type: {
          summary: "number[]",
        },
      },
    },
  },
} satisfies Meta;

const Template: StoryFn = (args) => ({
  components: { VcField },
  setup() {
    return { args };
  },
  template: `
    <vc-field v-bind="args" />
  `,
  args: {},
});

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
  type: "text",
  modelValue: "Field Value",
};

export const DateType = Template.bind({});
DateType.args = {
  ...Template.args,
  type: "date",
  modelValue: new Date(),
};

export const DateAgo = Template.bind({});
DateAgo.args = {
  ...Template.args,
  type: "date-ago",
  modelValue: new Date(),
};

export const Link = Template.bind({});
Link.args = {
  ...Template.args,
  type: "link",
  modelValue: "https://virtocommerce.com/",
};

export const LinkCopyable = Template.bind({});
LinkCopyable.args = {
  ...Template.args,
  type: "link",
  modelValue: "https://virtocommerce.com/",
  copyable: true,
};

export const Email = Template.bind({});
Email.args = {
  ...Template.args,
  type: "email",
  modelValue: "email@virtocommerce.com",
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  ...Template.args,
  orientation: "horizontal",
};

export const HorizontalAspectRatio = Template.bind({});
HorizontalAspectRatio.args = {
  ...Template.args,
  orientation: "horizontal",
  aspectRatio: [1, 2],
};
