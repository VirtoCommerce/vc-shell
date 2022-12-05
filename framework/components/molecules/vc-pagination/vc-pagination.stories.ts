/**
 * Pagination component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcPagination from "./vc-pagination.vue";

export default {
  title: "molecules/vc-pagination",
  component: VcPagination,
};

const Template: Story = (args) => ({
  components: { VcPagination },
  setup() {
    return { args };
  },
  template: '<vc-pagination v-bind="args"></vc-pagination>',
});

export const Pagination = Template.bind({});
Pagination.storyName = "vc-pagination";
Pagination.args = {};
