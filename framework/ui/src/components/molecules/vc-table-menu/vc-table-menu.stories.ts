/**
 * Table Menu component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTableMenu from "./vc-table-menu.vue";

export default {
  title: "molecules/vc-table-menu",
  component: VcTableMenu,
};

const Template: Story = (args) => ({
  components: { VcTableMenu },
  setup() {
    return { args };
  },
  template: '<vc-table-menu v-bind="args"></vc-table-menu>',
});

export const TableMenu = Template.bind({});
TableMenu.storyName = "vc-table-menu";
TableMenu.args = {};
