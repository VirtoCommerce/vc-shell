/**
 * Form Label component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormLabel from "./vc-form-label.vue";

export default {
  title: "molecules/vc-form-label",
  component: VcFormLabel,
};

const Template: Story = (args) => ({
  components: { VcFormLabel },
  setup() {
    return { args };
  },
  template: '<vc-form-label v-bind="args"></vc-form-label>',
});

export const FormLabel = Template.bind({});
FormLabel.storyName = "vc-form-label";
FormLabel.args = {};
