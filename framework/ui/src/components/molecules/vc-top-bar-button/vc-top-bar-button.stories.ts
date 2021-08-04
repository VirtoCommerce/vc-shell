/**
 * Top Bar Button component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTopBarButton from "./vc-top-bar-button.vue";

export default {
  title: "molecules/vc-top-bar-button",
  component: VcTopBarButton,
};

const Template: Story = (args) => ({
  components: { VcTopBarButton },
  setup() {
    return { args };
  },
  template: '<vc-top-bar-button v-bind="args"></vc-top-bar-button>',
});

export const TopBarButton = Template.bind({});
TopBarButton.storyName = "vc-top-bar-button";
TopBarButton.args = {};
