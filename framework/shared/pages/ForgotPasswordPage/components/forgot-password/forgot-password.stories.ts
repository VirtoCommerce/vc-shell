import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ForgotPassword from "./ForgotPassword.vue";
import { mockPlatformApiFetch, patchUserManagement } from "@shared/pages/_storybook-helpers";

const meta = {
  title: "Shared/Pages/ForgotPassword",
  component: ForgotPassword,
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
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Forgot password page. User enters email, receives a reset link. Shows masked email confirmation on success. Supports custom composable for password reset logic.",
      },
    },
  },
} satisfies Meta<typeof ForgotPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomBackground: Story = {
  args: {
    background: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  },
};
