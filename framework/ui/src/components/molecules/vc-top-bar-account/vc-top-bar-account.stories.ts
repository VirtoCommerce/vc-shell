/**
 * Top Bar Account component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTopBarAccount from "./vc-top-bar-account.vue";

export default {
  title: "molecules/vc-top-bar-account",
  component: VcTopBarAccount,
};

const Template: Story = (args) => ({
  components: { VcTopBarAccount },
  setup() {
    return { args };
  },
  template: '<vc-top-bar-account v-bind="args"></vc-top-bar-account>',
});

export const TopBarAccount = Template.bind({});
TopBarAccount.storyName = "vc-top-bar-account";
TopBarAccount.args = {};
