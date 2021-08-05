/**
 * Filter component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFilter from "./vc-filter.vue";

export default {
  title: "organisms/vc-filter",
  component: VcFilter,
};

const Template: Story = (args) => ({
  components: { VcFilter },
  setup() {
    return { args };
  },
  template: '<vc-filter v-bind="args"></vc-filter>',
});

export const Filter = Template.bind({});
Filter.storyName = "vc-filter";
Filter.args = {};
