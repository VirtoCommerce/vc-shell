/**
 * Form Checkbox component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormCheckbox from "./vc-form-checkbox.vue";

export default {
  title: "molecules/vc-form-checkbox",
  component: VcFormCheckbox,
};

const Template: Story = (args) => ({
  components: { VcFormCheckbox },
  setup() {
    return { args };
  },
  template: '<vc-form-checkbox v-bind="args"></vc-form-checkbox>',
});

export const FormCheckbox = Template.bind({});
FormCheckbox.storyName = "vc-form-checkbox";
FormCheckbox.args = {
  checked: false,
};
