/**
 * Button story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcButton from "../components/vc-button";

export default {
  title: "Button",
  component: VcButton,
  argTypes: {
    variant: {
      options: ["primary", "secondary", "special"],
      control: { type: "radio" },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { VcButton },
  props: Object.keys(argTypes),
  template: '<vc-button v-bind="$props" v-on="$props"></vc-button>',
});

export const Button = Template.bind({});
Button.args = {
  icon: "star",
  title: "I am a button",
  variant: "special",
  disabled: false,
  small: false,
};
