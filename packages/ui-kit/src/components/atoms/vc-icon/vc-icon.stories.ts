/**
 * Icon component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcIcon from "./vc-icon.vue";

export default {
  title: "atoms/vc-icon",
  component: VcIcon,
  argTypes: {
    family: {
      options: ["solid", "regular"],
      control: { type: "radio" },
    },
    size: {
      options: ["xs", "s", "m", "l", "xl"],
      control: { type: "radio" },
    },
  },
};

const Template: Story = (args) => ({
  components: { VcIcon },
  setup() { return { args } },
  template: '<vc-icon v-bind="args"></vc-icon>',
});

export const Icon = Template.bind({});
Icon.storyName = "vc-icon";
Icon.args = {
  icon: "star",
  family: "solid",
  size: "m",
};
