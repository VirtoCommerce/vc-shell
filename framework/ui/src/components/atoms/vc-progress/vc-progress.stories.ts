/**
 * Progress component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcProgress from "./vc-progress.vue";

export default {
  title: "atoms/vc-progress",
  component: VcProgress,
};

const Template: Story = (args) => ({
  components: { VcProgress },
  setup() {
    return { args };
  },
  template: '<vc-progress v-bind="args"></vc-progress>',
});

export const Progress = Template.bind({});
Progress.storyName = "vc-progress";
Progress.args = {
  value: 30,
};
