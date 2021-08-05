/**
 * Blade Toolbar Divider component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBladeToolbarDivider from "./vc-blade-toolbar-divider.vue";

export default {
  title: "molecules/vc-blade-toolbar-divider",
  component: VcBladeToolbarDivider,
};

const Template: Story = (args) => ({
  components: { VcBladeToolbarDivider },
  setup() {
    return { args };
  },
  template:
    '<vc-blade-toolbar-divider v-bind="args"></vc-blade-toolbar-divider>',
});

export const BladeToolbarDivider = Template.bind({});
BladeToolbarDivider.storyName = "vc-blade-toolbar-divider";
BladeToolbarDivider.args = {};
