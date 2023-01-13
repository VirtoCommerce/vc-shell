/**
 * Badge component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBadge from "./vc-badge.vue";

export default {
  title: "atoms/vc-badge",
  component: VcBadge,
};

const Template: Story = (args) => ({
  components: { VcBadge },
  setup() {
    return { args };
  },
  template: '<vc-badge v-bind="args">42</vc-badge>',
});

export const Badge = Template.bind({});
Badge.storyName = "vc-badge";
Badge.args = {
  active: false,
  disabled: false,
  clickable: true,
};
