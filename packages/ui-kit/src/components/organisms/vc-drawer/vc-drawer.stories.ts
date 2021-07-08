/**
 * Drawer component.
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcDrawer from "./vc-drawer.vue";

export default {
  title: "organisms/vc-drawer",
  component: VcDrawer,
  argTypes: {
    collapse: { action: "collapse", name: "collapse" },
    expand: { action: "expand", name: "expand" },
  },
};

const Template: Story = (args) => ({
  components: { VcDrawer },
  setup() { return { args } },
  template: '<vc-drawer v-bind="args"></vc-drawer>',
});

export const Drawer = Template.bind({});
Drawer.storyName = "vc-drawer";
Drawer.args = {
  version: "0.0.1",
  logo: "/images/logo.svg",
  items: [
    {
      id: 1,
      title: "Another Item",
      icon: "star",
    },
  ],
};
