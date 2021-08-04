/**
 * Form Select component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormSelect from "./vc-form-select.vue";

export default {
  title: "molecules/vc-form-select",
  component: VcFormSelect,
};

const Template: Story = (args) => ({
  components: { VcFormSelect },
  setup() {
    return { args };
  },
  template: '<vc-form-select v-bind="args"></vc-form-select>',
});

export const FormSelect = Template.bind({});
FormSelect.storyName = "vc-form-select";
FormSelect.args = {};
