import type { Meta, StoryObj } from "@storybook/vue3";
import { VcLoginForm } from "./";
import { VcInput, VcButton } from "./../../";

const meta: Meta<typeof VcLoginForm> = {
  title: "organisms/VcLoginForm",
  component: VcLoginForm,
};

export default meta;
type Story = StoryObj<typeof VcLoginForm>;

export const Primary: Story = {
  render: (args) => ({
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
      <vc-button >
        Submit
      </vc-button>
    </div>
  </vc-login-form>`,
  }),
  args: {
    background: "images/background.jpg",
    logo: "images/logo-white.svg",
  },
};
