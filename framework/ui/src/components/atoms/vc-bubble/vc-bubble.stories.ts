/**
 * Bubble component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBubble from "./vc-bubble.vue";

export default {
  title: "atoms/vc-bubble",
  component: VcBubble,
};

const Template: Story = (args) => ({
  components: { VcBubble },
  setup() {
    return { args };
  },
  template: '<vc-bubble v-bind="args"></vc-bubble>',
});

export const Bubble = Template.bind({});
Bubble.storyName = "vc-bubble";
Bubble.args = {};
