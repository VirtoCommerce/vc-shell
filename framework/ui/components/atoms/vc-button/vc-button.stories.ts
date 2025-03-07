import type { Meta, StoryFn } from "@storybook/vue3";
import { VcButton } from "./";

const COLORS = ["primary", "secondary"];

const PROPERTY = ["disabled", "small", "outline", "selected", "text", "raised"];

const ICON_SIZE = ["xs", "s", "m", "l", "xl", "xxl", "xxxl"];

export default {
  title: "atoms/VcButton",
  component: VcButton,
  args: {
    default: "I am a button",
    variant: "primary",
    iconSize: "s",
  },
  argTypes: {
    default: {
      control: "text",
    },
    icon: { control: "text" },
    iconClass: { control: "text" },
    iconSize: {
      control: "radio",
      table: {
        type: {
          summary: ICON_SIZE.join(" | "),
        },
      },
      options: ICON_SIZE,
    },
    variant: {
      control: "radio",
      options: ["primary", "warning", "danger"],
      table: {
        type: {
          summary: COLORS.join(" | "),
        },
      },
    },
    disabled: { control: "boolean" },
    small: { control: "boolean" },
    outline: { control: "boolean" },
    selected: { control: "boolean" },
    text: { control: "boolean" },
    raised: { control: "boolean" },
  },
} satisfies Meta<typeof VcButton>;

export const Template: StoryFn<typeof VcButton> = (args) => ({
  components: { VcButton },
  setup() {
    return { args };
  },
  template: '<VcButton v-bind="args">{{args.default}}</VcButton>',
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Selected = Template.bind({});
Selected.args = { selected: true };

export const Text = Template.bind({});
Text.args = { text: true };

export const Icon = Template.bind({});
Icon.args = { icon: "fas fa-plus" };

export const IconClass = Template.bind({});
IconClass.args = { icon: "fas fa-plus", iconClass: "tw-text-red" };

export const IconSize = Template.bind({});
IconSize.args = { icon: "fas fa-plus", iconSize: "l" };

export const AllStates: StoryFn<typeof VcButton> = () => ({
  components: { VcButton },
  setup: () => ({ colors: COLORS, properties: PROPERTY }),
  template: `
    <div class="tw-space-y-8">
    <div v-for="property in properties" class="tw-space-y-8">

    <h2 class="tw-font-bold tw-text-2xl">Property: {{property}}</h2>


    <div v-for="color in colors" class="tw-space-y-2">
      <p class="tw-font-bold">Color: {{color}}</p>
      <div class="tw-flex tw-flex-row tw-space-x-4">
          <div v-for="prop in properties.filter(x => x !== property)" class="tw-space-y-4">
            <p class="tw-font-bold tw-text-sm">Property: {{prop}}</p>
            <VcButton :[property]="true" :[prop]="true" :variant="color">I am a button</VcButton>

          </div>
      </div>
    </div>

    </div>
    </div>
  `,
});
