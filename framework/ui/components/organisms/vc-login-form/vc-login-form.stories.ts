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
        class="tw-mb-4 tw-mt-1"
        label="Username"
        placeholder="Enter username"
    ></vc-input>
    <vc-input
        ref="passwordField"
        class="tw-mb-4"
        label="Password"
        placeholder="Enter password"
        type="password"
    ></vc-input>
    <div
        class="
            flex
            tw-justify-center
            tw-items-center
            tw-pt-2
          "
    >
      <span class="tw-grow tw-basis-0"></span>
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
