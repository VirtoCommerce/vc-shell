/**
 * Status component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcStatus from "./vc-status.vue";

export default {
  title: "atoms/vc-status",
  component: VcStatus,
};

const Template: Story = (args) => ({
  components: { VcStatus },
  setup() {
    return { args };
  },
  template: '<vc-status v-bind="args">Status text</vc-status>',
});

export const Status = Template.bind({});
Status.storyName = "vc-status";
Status.args = {
  disabled: false,
  clickable: true,
};
