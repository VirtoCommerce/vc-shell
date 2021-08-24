/**
 * Switch component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcSwitch from "./vc-switch.vue";

export default {
  title: "molecules/vc-switch",
  component: VcSwitch,
};

const Template: Story = (args) => ({
  components: { VcSwitch },
  setup() {
    return { args };
  },
  template: '<vc-switch v-bind="args"></vc-switch>',
});

export const Switch = Template.bind({});
Switch.storyName = "vc-switch";
Switch.args = {};
