/**
 * Input story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcInput from "./vc-input";

export default {
  title: "atoms/vc-input",
  component: VcInput,
};

const Template = (args, { argTypes }) => ({
  components: { VcInput },
  props: Object.keys(argTypes),
  template: '<vc-input v-bind="$props" v-on="$props"></vc-input>',
});

export const Input = Template.bind({});
Input.args = {
  placeholder: "Placeholder",
  clearable: true,
};
