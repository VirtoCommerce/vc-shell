/**
 * Icon story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcIcon from "../components/vc-icon";

export default {
  title: "Icon",
  component: VcIcon,
  argTypes: {
    family: {
      options: ["solid", "regular"],
      control: { type: "radio" }
    },
    size: {
      options: ["xs", "s", "m", "l", "xl"],
      control: { type: "radio" }
    }
  }
};

const Template = (args, { argTypes }) => ({
  components: { VcIcon },
  props: Object.keys(argTypes),
  template: '<vc-icon v-bind="$props" v-on="$props"></vc-icon>'
});

export const Icon = Template.bind({});
Icon.args = {
  icon: "star",
  family: "solid",
  size: "m"
};
