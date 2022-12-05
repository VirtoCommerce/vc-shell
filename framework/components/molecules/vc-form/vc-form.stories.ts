/**
 * Form component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcForm from "./vc-form.vue";

export default {
  title: "molecules/vc-form",
  component: VcForm,
};

const Template: Story = (args) => ({
  components: { VcForm },
  setup() {
    return { args };
  },
  template: '<vc-form v-bind="args"></vc-form>',
});

export const Form = Template.bind({});
Form.storyName = "vc-form";
Form.args = {};
