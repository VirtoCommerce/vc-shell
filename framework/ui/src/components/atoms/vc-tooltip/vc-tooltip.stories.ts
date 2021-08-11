/**
 * Tooltip component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTooltip from "./vc-tooltip.vue";

export default {
  title: "atoms/vc-tooltip",
  component: VcTooltip,
};

const Template: Story = (args) => ({
  components: { VcTooltip },
  setup() {
    return { args };
  },
  template: '<vc-tooltip v-bind="args">This is a tooltip</vc-tooltip>',
});

export const Tooltip = Template.bind({});
Tooltip.storyName = "vc-tooltip";
Tooltip.args = {};
