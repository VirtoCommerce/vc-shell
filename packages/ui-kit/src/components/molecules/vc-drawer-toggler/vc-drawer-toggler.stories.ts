/**
 * DrawerToggler component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcDrawerToggler from "./vc-drawer-toggler.vue";

export default {
  title: "molecules/vc-drawer-toggler",
  component: VcDrawerToggler,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template: Story = (args) => ({
  components: { VcDrawerToggler },
  setup() { return { args } },
  template:
    '<vc-drawer-toggler v-bind="args"></vc-drawer-toggler>',
});

export const DrawerToggler = Template.bind({});
DrawerToggler.storyName = "vc-drawer-toggler";
DrawerToggler.args = {};
