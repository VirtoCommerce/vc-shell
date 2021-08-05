/**
 * Form Switch component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormSwitch from "./vc-form-switch.vue";

export default {
  title: "molecules/vc-form-switch",
  component: VcFormSwitch,
};

const Template: Story = (args) => ({
  components: { VcFormSwitch },
  setup() {
    return { args };
  },
  template: '<vc-form-switch v-bind="args"></vc-form-switch>',
});

export const FormSwitch = Template.bind({});
FormSwitch.storyName = "vc-form-switch";
FormSwitch.args = {};
