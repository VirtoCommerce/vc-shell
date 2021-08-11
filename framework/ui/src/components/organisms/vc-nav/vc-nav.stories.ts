/**
 * Nav component.
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNav from "./vc-nav.vue";

export default {
  title: "organisms/vc-nav",
  component: VcNav,
  argTypes: {
    collapse: { action: "collapse", name: "collapse" },
    expand: { action: "expand", name: "expand" },
  },
};

const Template: Story = (args) => ({
  components: { VcNav },
  setup() {
    return { args };
  },
  template: '<vc-nav v-bind="args"></vc-nav>',
});

export const Nav = Template.bind({});
Nav.storyName = "vc-nav";
Nav.args = {
  version: "0.0.1",
  logo: "/images/logo.svg",
  items: [
    {
      id: 1,
      title: "Another Item",
      icon: "fas fa-star",
    },
  ],
};
