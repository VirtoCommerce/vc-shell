/**
 * Link story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcLink from "./vc-link";

export default {
  title: "atoms/vc-link",
  component: VcLink,
  argTypes: {
    click: { action: "click", name: "click" },
  },
};

const Template = (args, { argTypes }) => ({
  components: { VcLink },
  props: Object.keys(argTypes),
  template: '<vc-link v-bind="$props" v-on="$props">This is link</vc-link>',
});

export const Link = Template.bind({});
Link.args = {
  to: "/",
  disabled: false,
};
