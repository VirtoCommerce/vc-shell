/**
 * Topbar component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTopbar from "./vc-topbar.vue";

export default {
  title: "organisms/vc-topbar",
  component: VcTopbar,
};

const Template: Story = (args) => ({
  components: { VcTopbar },
  setup() {
    return { args };
  },
  template: '<vc-topbar v-bind="args"></vc-topbar>',
});

export const Topbar = Template.bind({});
Topbar.storyName = "vc-topbar";
Topbar.args = {};
