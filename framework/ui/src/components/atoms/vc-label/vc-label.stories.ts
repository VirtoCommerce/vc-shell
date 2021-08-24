/**
 * Label component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLabel from "./vc-label.vue";

export default {
  title: "molecules/vc-label",
  component: VcLabel,
};

const Template: Story = (args) => ({
  components: { VcLabel },
  setup() {
    return { args };
  },
  template: '<vc-label v-bind="args">This is a label</vc-label>',
});

export const Label = Template.bind({});
Label.storyName = "vc-label";
Label.args = {};
