/**
 * Login Form component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLoginForm from "./vc-login-form.vue";
import VcInput from "../../molecules/vc-input/vc-input.vue";
import VcButton from "../../atoms/vc-button/vc-button.vue";

export default {
  title: "organisms/vc-login-form",
  component: VcLoginForm,
};

const Template: Story = (args) => ({
  components: { VcLoginForm, VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `<vc-login-form v-bind="args">
    <vc-input
        ref="loginField"
        class="vc-margin-bottom_l vc-margin-top_xs"
        label="Username"
        placeholder="Enter username"
    ></vc-input>
    <vc-input
        ref="passwordField"
        class="vc-margin-bottom_l"
        label="Password"
        placeholder="Enter password"
        type="password"
    ></vc-input>
    <div
        class="
            vc-flex
            vc-flex-justify_center
            vc-flex-align_center
            vc-padding-top_s
          "
    >
      <span class="vc-flex-grow_1"></span>
      <vc-button variant="primary">
        Submit
      </vc-button>
    </div>
  </vc-login-form>`,
});

export const LoginForm = Template.bind({});
LoginForm.storyName = "vc-login-form";
LoginForm.args = {
  background: "images/background.jpg",
  logo: "images/logo-white.svg",
};
