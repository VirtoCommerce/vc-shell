import { defineComponent, onUnmounted, provide } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LogoutButton from "@shared/components/logout-button/logout-button.vue";
import { useUserManagement } from "@core/composables/useUserManagement";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { useRouter } from "vue-router";

function patchLogoutFlow() {
  const userManagement = useUserManagement();
  const router = useRouter();

  const originalSignOut = userManagement.signOut;
  userManagement.signOut = async () => {};

  if (!router.hasRoute("Login")) {
    router.addRoute({
      name: "Login",
      path: "/login",
      component: defineComponent({
        name: "StorybookLoginPage",
        template: "<div />",
      }),
    });
  }

  onUnmounted(() => {
    userManagement.signOut = originalSignOut;
  });
}

const meta = {
  title: "Shared/LogoutButton",
  component: LogoutButton,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        patchLogoutFlow();
        provide(CloseSettingsMenuKey, () => {});
      },
      template: `
        <div class="tw-w-[300px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-1">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Settings menu action for sign-out. Story patches user-management signOut with a no-op and ensures Login route exists, so click interactions stay local to Storybook.",
      },
    },
  },
} satisfies Meta<typeof LogoutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
