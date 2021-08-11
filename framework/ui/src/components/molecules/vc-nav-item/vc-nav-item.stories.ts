/**
 * Nav Item component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNavItem from "./vc-nav-item.vue";

export default {
  title: "molecules/vc-nav-item",
  component: VcNavItem,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template: Story = (args) => ({
  components: { VcNavItem },
  setup() {
    return { args };
  },
  template: '<vc-nav-item v-bind="args"></vc-nav-item>',
});

export const NavItem = Template.bind({});
NavItem.storyName = "vc-nav-item";
NavItem.args = {
  icon: "fas fa-folder",
  sticky: false,
  title: "Nav Item",
};
