/**
 * Breadcrumbs Back component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBreadcrumbsBack from "./vc-breadcrumbs-back.vue";

export default {
  title: "molecules/vc-breadcrumbs-back",
  component: VcBreadcrumbsBack,
};

const Template: Story = (args) => ({
  components: { VcBreadcrumbsBack },
  setup() {
    return { args };
  },
  template: '<vc-breadcrumbs-back v-bind="args"></vc-breadcrumbs-back>',
});

export const BreadcrumbsBack = Template.bind({});
BreadcrumbsBack.storyName = "vc-breadcrumbs-back";
BreadcrumbsBack.args = {};
