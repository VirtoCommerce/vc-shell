/**
 * Progressbar component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcProgressbar from "./vc-progressbar.vue";

export default {
  title: "atoms/vc-progressbar",
  component: VcProgressbar,
};

const Template: Story = (args) => ({
  components: { VcProgressbar },
  setup() {
    return { args };
  },
  template: '<vc-progressbar v-bind="args"></vc-progressbar>',
});

export const Progressbar = Template.bind({});
Progressbar.storyName = "vc-progressbar";
Progressbar.args = {
  value: 30,
};
