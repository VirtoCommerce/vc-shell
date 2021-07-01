/**
 * Checkbox story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcCheckbox from "../components/vc-checkbox";

export default {
  title: "Checkbox",
  component: VcCheckbox
};

const Template = (args, { argTypes }) => ({
  components: { VcCheckbox },
  props: Object.keys(argTypes),
  template: '<vc-checkbox v-bind="$props" v-on="$props"></vc-checkbox>'
});

export const Checkbox = Template.bind({});
Checkbox.args = {};
