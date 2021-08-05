/**
 * Spacer component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcSpacer from "./vc-spacer.vue";

export default {
  title: "atoms/vc-spacer",
  component: VcSpacer,
};

const Template: Story = (args) => ({
  components: { VcSpacer },
  setup() {
    return { args };
  },
  template: '<vc-spacer v-bind="args"></vc-spacer>',
});

export const Spacer = Template.bind({});
Spacer.storyName = "vc-spacer";
Spacer.args = {};
