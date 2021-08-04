/**
 * Top Bar Logo component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTopBarLogo from "./vc-top-bar-logo.vue";

export default {
  title: "molecules/vc-top-bar-logo",
  component: VcTopBarLogo,
};

const Template: Story = (args) => ({
  components: { VcTopBarLogo },
  setup() {
    return { args };
  },
  template: '<vc-top-bar-logo v-bind="args"></vc-top-bar-logo>',
});

export const TopBarLogo = Template.bind({});
TopBarLogo.storyName = "vc-top-bar-logo";
TopBarLogo.args = {};
