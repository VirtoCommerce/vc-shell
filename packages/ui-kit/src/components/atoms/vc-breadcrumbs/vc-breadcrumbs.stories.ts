/**
 * Breadcrumbs component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcBreadcrumbs from "./vc-breadcrumbs.vue";

export default {
  title: "atoms/vc-breadcrumbs",
  component: VcBreadcrumbs,
};

const Template: Story = (args) => ({
  components: { VcBreadcrumbs },
  setup() { return { args } },
  template: '<vc-breadcrumbs v-bind="args"></vc-breadcrumbs>',
});

export const Breadcrumbs = Template.bind({});
Breadcrumbs.storyName = "vc-breadcrumbs";
Breadcrumbs.args = {
  items: [
    {
      id: 0,
      title: "Back",
      icon: "arrow-left",
    },
    {
      id: 1,
      title: "Electronics",
    },
    {
      id: 2,
      title: "Desktop",
    },
  ],
};
