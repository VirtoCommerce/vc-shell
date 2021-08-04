/**
 * Table Actions component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTableActions from "./vc-table-actions.vue";

export default {
  title: "molecules/vc-table-actions",
  component: VcTableActions,
};

const Template: Story = (args) => ({
  components: { VcTableActions },
  setup() {
    return { args };
  },
  template: '<vc-table-actions v-bind="args"></vc-table-actions>',
});

export const TableActions = Template.bind({});
TableActions.storyName = "vc-table-actions";
TableActions.args = {};
