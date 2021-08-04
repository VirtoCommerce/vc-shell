/**
 * Table Counter component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTableCounter from "./vc-table-counter.vue";

export default {
  title: "molecules/vc-table-counter",
  component: VcTableCounter,
};

const Template: Story = (args) => ({
  components: { VcTableCounter },
  setup() {
    return { args };
  },
  template: '<vc-table-counter v-bind="args"></vc-table-counter>',
});

export const TableCounter = Template.bind({});
TableCounter.storyName = "vc-table-counter";
TableCounter.args = {};
