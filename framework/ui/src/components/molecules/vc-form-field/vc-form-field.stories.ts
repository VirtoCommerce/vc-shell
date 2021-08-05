/**
 * Form Field component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormField from "./vc-form-field.vue";

export default {
  title: "molecules/vc-form-field",
  component: VcFormField,
};

const Template: Story = (args) => ({
  components: { VcFormField },
  setup() {
    return { args };
  },
  template: '<vc-form-field v-bind="args"></vc-form-field>',
});

export const FormField = Template.bind({});
FormField.storyName = "vc-form-field";
FormField.args = {};
