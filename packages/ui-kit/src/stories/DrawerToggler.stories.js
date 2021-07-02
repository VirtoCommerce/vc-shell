/**
 * DrawerToggler story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcDrawerToggler from "../components/vc-drawer-toggler";

export default {
  title: "Drawer Toggler",
  component: VcDrawerToggler,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template = (args, { argTypes }) => ({
  components: { VcDrawerToggler },
  props: Object.keys(argTypes),
  template:
    '<vc-drawer-toggler v-bind="$props" v-on="$props"></vc-drawer-toggler>',
});

export const DrawerToggler = Template.bind({});
DrawerToggler.args = {};
