/**
 * Nav Group component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNavGroup from "./vc-nav-group.vue";

export default {
  title: "molecules/vc-nav-group",
  component: VcNavGroup,
};

const Template: Story = (args) => ({
  components: { VcNavGroup },
  setup() {
    return { args };
  },
  template: '<vc-nav-group v-bind="args"></vc-nav-group>',
});

export const NavGroup = Template.bind({});
NavGroup.storyName = "vc-nav-group";
NavGroup.args = {};
