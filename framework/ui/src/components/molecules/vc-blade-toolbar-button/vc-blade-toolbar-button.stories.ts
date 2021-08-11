/**
 * Blade Toolbar Button component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBladeToolbarButton from "./vc-blade-toolbar-button.vue";

export default {
  title: "molecules/vc-blade-toolbar-button",
  component: VcBladeToolbarButton,
};

const Template: Story = (args) => ({
  components: { VcBladeToolbarButton },
  setup() {
    return { args };
  },
  template: '<vc-blade-toolbar-button v-bind="args"></vc-blade-toolbar-button>',
});

export const BladeToolbarButton = Template.bind({});
BladeToolbarButton.storyName = "vc-blade-toolbar-button";
BladeToolbarButton.args = {
  icon: "fas fa-trash",
  title: "Delete",
  disabled: false,
};
