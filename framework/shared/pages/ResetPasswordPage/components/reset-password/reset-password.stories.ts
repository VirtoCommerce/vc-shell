import { onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ResetPassword from "./ResetPassword.vue";
import { useUserManagement } from "@core/composables/useUserManagement";
import { mockPlatformApiFetch, patchUserManagement } from "@shared/pages/_storybook-helpers";

/** Reset password page reached via email link with token validation. */
const meta = {
  title: "Shared/Pages/ResetPasswordPage",
  component: ResetPassword,
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
    userId: "mock-user-id",
    userName: "john@example.com",
    token: "mock-reset-token",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Reset password page reached via email link. Validates token on mount, then allows setting a new password with confirmation. Auto-signs in on success.",
      },
    },
  },
} satisfies Meta<typeof ResetPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomBackground: Story = {
  args: {
    background: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  },
};

export const InvalidToken: Story = {
  args: {
    token: "expired-token",
  },
  decorators: [
    () => ({
      setup() {
        const userManagement = useUserManagement();
        const orig = userManagement.validateToken;
        userManagement.validateToken = async () => false;
        onUnmounted(() => {
          userManagement.validateToken = orig;
        });
      },
      template: "<story />",
    }),
  ],
};
