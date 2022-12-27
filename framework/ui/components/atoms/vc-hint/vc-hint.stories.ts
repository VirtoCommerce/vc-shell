/**
 * Hint component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcHint from "./vc-hint.vue";

export default {
  title: "atoms/vc-hint",
  component: VcHint,
};

const Template: Story = (args) => ({
  components: { VcHint },
  setup() {
    return { args };
  },
  template: '<vc-hint v-bind="args">This is a hint</vc-hint>',
});

export const Hint = Template.bind({});
Hint.storyName = "vc-hint";
Hint.args = {};
