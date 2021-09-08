/**
 * Autocomplete component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcAutocomplete from "./vc-autocomplete.vue";

export default {
  title: "molecules/vc-autocomplete",
  component: VcAutocomplete,
};

const Template: Story = (args) => ({
  components: { VcAutocomplete },
  setup() {
    return { args };
  },
  template: '<vc-autocomplete v-bind="args"></vc-autocomplete>',
});

export const Autocomplete = Template.bind({});
Autocomplete.storyName = "vc-autocomplete";
Autocomplete.args = {};
