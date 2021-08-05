/**
 * Form Input component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormInput from "./vc-form-input.vue";

export default {
  title: "molecules/vc-form-input",
  component: VcFormInput,
};

const Template: Story = (args) => ({
  components: { VcFormInput },
  setup() {
    return { args };
  },
  template: '<vc-form-input v-bind="args"></vc-form-input>',
});

export const FormInput = Template.bind({});
FormInput.storyName = "vc-form-input";
FormInput.args = {
  placeholder: "Placeholder",
  clearable: true,
};
