/**
 * Nav Divider component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNavDivider from "./vc-nav-divider.vue";

export default {
  title: "molecules/vc-nav-divider",
  component: VcNavDivider,
};

const Template: Story = (args) => ({
  components: { VcNavDivider },
  setup() {
    return { args };
  },
  template: '<vc-nav-divider v-bind="args"></vc-nav-divider>',
});

export const NavDivider = Template.bind({});
NavDivider.storyName = "vc-nav-divider";
NavDivider.args = {};
