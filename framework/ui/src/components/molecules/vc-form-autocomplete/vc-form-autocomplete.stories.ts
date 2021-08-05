/**
 * Form Autocomplete component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormAutocomplete from "./vc-form-autocomplete.vue";

export default {
  title: "molecules/vc-form-autocomplete",
  component: VcFormAutocomplete,
};

const Template: Story = (args) => ({
  components: { VcFormAutocomplete },
  setup() {
    return { args };
  },
  template: '<vc-form-autocomplete v-bind="args"></vc-form-autocomplete>',
});

export const FormAutocomplete = Template.bind({});
FormAutocomplete.storyName = "vc-form-autocomplete";
FormAutocomplete.args = {};
