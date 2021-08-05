/**
 * Blade Toolbar Back component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBladeToolbarBack from "./vc-blade-toolbar-back.vue";

export default {
  title: "molecules/vc-blade-toolbar-back",
  component: VcBladeToolbarBack,
};

const Template: Story = (args) => ({
  components: { VcBladeToolbarBack },
  setup() {
    return { args };
  },
  template: '<vc-blade-toolbar-back v-bind="args"></vc-blade-toolbar-back>',
});

export const BladeToolbarBack = Template.bind({});
BladeToolbarBack.storyName = "vc-blade-toolbar-back";
BladeToolbarBack.args = {};
