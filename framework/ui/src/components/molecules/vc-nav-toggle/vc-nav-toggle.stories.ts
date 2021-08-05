/**
 * Nav Toggle component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNavToggle from "./vc-nav-toggle.vue";

export default {
  title: "molecules/vc-nav-toggle",
  component: VcNavToggle,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template: Story = (args) => ({
  components: { VcNavToggle },
  setup() {
    return { args };
  },
  template: '<vc-nav-toggle v-bind="args"></vc-nav-toggle>',
});

export const NavToggle = Template.bind({});
NavToggle.storyName = "vc-nav-toggle";
NavToggle.args = {};
