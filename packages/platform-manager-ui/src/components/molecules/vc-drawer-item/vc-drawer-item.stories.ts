/**
 * DrawerItem component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcDrawerItem from "./vc-drawer-item.vue";

export default {
  title: "molecules/vc-drawer-item",
  component: VcDrawerItem,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template: Story = (args) => ({
  components: { VcDrawerItem },
  setup() {
    return { args };
  },
  template: '<vc-drawer-item v-bind="args"></vc-drawer-item>',
});

export const DrawerItem = Template.bind({});
DrawerItem.storyName = "vc-drawer-item";
DrawerItem.args = {
  icon: "folder",
  sticky: false,
  title: "Drawer Item",
};
