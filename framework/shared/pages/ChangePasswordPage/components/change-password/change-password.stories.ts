import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ChangePassword from "./ChangePassword.vue";
import { mockPlatformApiFetch, patchUserManagement } from "@shared/pages/_storybook-helpers";

/** Change password page with current/new/confirm fields and real-time validation. */
const meta = {
  title: "Shared/Pages/ChangePasswordPage",
  component: ChangePassword,
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
          "Change password page with current/new/confirm fields and real-time validation. Supports `forced` mode when password is expired.",
      },
    },
  },
} satisfies Meta<typeof ChangePassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Forced: Story = {
  args: {
    forced: true,
  },
};

export const WithCustomBackground: Story = {
  args: {
    background: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  },
};
