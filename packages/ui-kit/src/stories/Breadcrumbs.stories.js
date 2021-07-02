/**
 * Breadcrumbs story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcBreadcrumbs from "../components/vc-breadcrumbs";

export default {
  title: "Breadcrumbs",
  component: VcBreadcrumbs,
};

const Template = (args, { argTypes }) => ({
  components: { VcBreadcrumbs },
  props: Object.keys(argTypes),
  template: '<vc-breadcrumbs v-bind="$props" v-on="$props"></vc-breadcrumbs>',
});

export const Breadcrumbs = Template.bind({});
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
