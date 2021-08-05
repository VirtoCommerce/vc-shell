/**
 * Blade Toolbar component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBladeToolbar from "./vc-blade-toolbar.vue";

export default {
  title: "organisms/vc-blade-toolbar",
  component: VcBladeToolbar,
};

const Template: Story = (args) => ({
  components: { VcBladeToolbar },
  setup() {
    return { args };
  },
  template: '<vc-blade-toolbar v-bind="args"></vc-blade-toolbar>',
});

export const BladeToolbar = Template.bind({});
BladeToolbar.storyName = "vc-blade-toolbar";
BladeToolbar.args = {};
