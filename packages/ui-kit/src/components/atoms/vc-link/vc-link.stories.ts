/**
 * Link component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcLink from "./vc-link.vue";

export default {
  title: "atoms/vc-link",
  component: VcLink,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template: Story = (args) => ({
  components: { VcLink },
  setup() { return { args } },
  template: '<vc-link v-bind="args">This is link</vc-link>',
});

export const Link = Template.bind({});
Link.storyName = "vc-link";
Link.args = {
  to: "/",
  disabled: false,
};
