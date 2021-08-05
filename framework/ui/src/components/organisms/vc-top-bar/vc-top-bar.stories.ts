/**
 * TopBar component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTopBar from "./vc-top-bar.vue";

export default {
  title: "organisms/vc-top-bar",
  component: VcTopBar,
};

const Template: Story = (args) => ({
  components: { VcTopBar },
  setup() {
    return { args };
  },
  template: '<vc-top-bar v-bind="args"></vc-top-bar>',
});

export const TopBar = Template.bind({});
TopBar.storyName = "vc-top-bar";
TopBar.args = {};
