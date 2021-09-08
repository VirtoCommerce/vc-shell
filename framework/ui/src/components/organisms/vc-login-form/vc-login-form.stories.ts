/**
 * Login Form component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLoginForm from "./vc-login-form.vue";

export default {
  title: "organisms/vc-login-form",
  component: VcLoginForm,
};

const Template: Story = (args) => ({
  components: { VcLoginForm },
  setup() {
    return { args };
  },
  template: `<vc-login-form v-bind="args"></vc-login-form>`,
});

export const LoginForm = Template.bind({});
LoginForm.storyName = "vc-login-form";
LoginForm.args = {};
