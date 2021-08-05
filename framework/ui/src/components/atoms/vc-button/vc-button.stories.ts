/**
 * Button component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcButton from "./vc-button.vue";

export default {
  title: "atoms/vc-button",
  component: VcButton,
  argTypes: {
    variant: {
      options: ["primary", "secondary", "special"],
      control: { type: "radio" },
    },
  },
};

const Template: Story = (args) => ({
  components: { VcButton },
  setup() {
    return { args };
  },
  template: '<vc-button v-bind="args">I am a button</vc-button>',
});

export const Button = Template.bind({});
Button.storyName = "vc-button";
Button.args = {
  icon: "star",
  variant: "special",
  disabled: false,
  small: false,
};
