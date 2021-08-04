/**
 * Table Search component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTableSearch from "./vc-table-search.vue";

export default {
  title: "molecules/vc-table-search",
  component: VcTableSearch,
};

const Template: Story = (args) => ({
  components: { VcTableSearch },
  setup() {
    return { args };
  },
  template: '<vc-table-search v-bind="args"></vc-table-search>',
});

export const TableSearch = Template.bind({});
TableSearch.storyName = "vc-table-search";
TableSearch.args = {};
