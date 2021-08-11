/**
 * Breadcrumbs Item component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBreadcrumbsItem from "./vc-breadcrumbs-item.vue";

export default {
  title: "molecules/vc-breadcrumbs-item",
  component: VcBreadcrumbsItem,
};

const Template: Story = (args) => ({
  components: { VcBreadcrumbsItem },
  setup() {
    return { args };
  },
  template: '<vc-breadcrumbs-item v-bind="args"></vc-breadcrumbs-item>',
});

export const BreadcrumbsItem = Template.bind({});
BreadcrumbsItem.storyName = "vc-breadcrumbs-item";
BreadcrumbsItem.args = {
  disabled: false,
  current: false,
  icon: "fas fa-star",
  title: "Electronics",
};
