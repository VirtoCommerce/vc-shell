/**
 * Table Filter component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTableFilter from "./vc-table-filter.vue";

export default {
  title: "molecules/vc-table-filter",
  component: VcTableFilter,
};

const Template: Story = (args) => ({
  components: { VcTableFilter },
  setup() {
    return { args };
  },
  template: '<vc-table-filter v-bind="args"></vc-table-filter>',
});

export const TableFilter = Template.bind({});
TableFilter.storyName = "vc-table-filter";
TableFilter.args = {};
