/**
 * Container component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcContainer from "./vc-container.vue";

export default {
  title: "atoms/vc-container",
  component: VcContainer,
};

const Template: Story = (args) => ({
  components: { VcContainer },
  setup() {
    return { args };
  },
  template: '<vc-container v-bind="args"></vc-container>',
});

export const Container = Template.bind({});
Container.storyName = "vc-container";
Container.args = {};
