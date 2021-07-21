/**
 * App component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcApp from "./vc-app.vue";

export default {
  title: "organisms/vc-app",
  component: VcApp,
};

const Template: Story = (args) => ({
  components: { VcApp },
  setup() {
    return { args };
  },
  template: '<vc-app v-bind="args"></vc-app>',
});

export const App = Template.bind({});
App.storyName = "vc-app";
App.args = {};
