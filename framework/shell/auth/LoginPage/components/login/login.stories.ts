import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Login from "./Login.vue";
import { mockPlatformApiFetch, patchUserManagement } from "@shell/_internal/_storybook-helpers";

/** Login page with credentials form, SSO providers, and forgot-password navigation. */
const meta = {
  title: "Shared/Pages/LoginPage",
  component: Login,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        mockPlatformApiFetch();
        patchUserManagement();
      },
      template: "<story />",
    }),
  ],
  args: {
    title: "Welcome back",
    subtitle: "Sign in to your account",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Login page with username/password form, SSO provider support, and forgot-password link. SSO providers require a live API and won't appear in Storybook.",
      },
    },
  },
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomBackground: Story = {
  args: {
    background: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
    title: "Vendor Portal",
    subtitle: "Manage your products and orders",
  },
};

export const SSOOnly: Story = {
  args: {
    ssoOnly: true,
    title: "Enterprise Login",
    subtitle: "Sign in with your organization account",
  },
};
