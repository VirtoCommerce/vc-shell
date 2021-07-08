/**
 * Input component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcInput from "./vc-input.vue";

export default {
  title: "atoms/vc-input",
  component: VcInput,
};

const Template: Story = (args) => ({
  components: { VcInput },
  setup() { return { args } },
  template: '<vc-input v-bind="args"></vc-input>',
});

export const Input = Template.bind({});
Input.storyName = "vc-input";
Input.args = {
  placeholder: "Placeholder",
  clearable: true,
};
