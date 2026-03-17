import { onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Invite from "./Invite.vue";
import { useUserManagement } from "@core/composables/useUserManagement";
import { mockPlatformApiFetch, patchUserManagement } from "@shared/pages/_storybook-helpers";

/** Invitation acceptance page with token validation and password setup. */
const meta = {
  title: "Shared/Pages/InvitePage",
  component: Invite,
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
    token: "mock-invite-token",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Invitation acceptance page. User sets a password for their invited account. Validates token on mount, then shows password/confirm fields. Auto-signs in on success.",
      },
    },
  },
} satisfies Meta<typeof Invite>;

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
