import { onUnmounted, provide } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ChangePasswordButton from "@shared/components/change-password-button/change-password-button.vue";
import { VcPopupContainer } from "@shared/components";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { useUserManagement } from "@core/composables/useUserManagement";
import { IdentityResult, SecurityResult } from "@core/api/platform";

function patchUserManagement() {
  const userManagement = useUserManagement();
  const originalValidatePassword = userManagement.validatePassword;
  const originalChangeUserPassword = userManagement.changeUserPassword;

  userManagement.validatePassword = async () =>
    new IdentityResult({
      succeeded: true,
      errors: [],
    });
  userManagement.changeUserPassword = async () =>
    new SecurityResult({
      succeeded: true,
      errors: [],
    });

  onUnmounted(() => {
    userManagement.validatePassword = originalValidatePassword;
    userManagement.changeUserPassword = originalChangeUserPassword;
  });
}

const meta = {
  title: "Shared/ChangePasswordButton",
  component: ChangePasswordButton,
  tags: ["autodocs"],
  decorators: [
    () => ({
      components: { VcPopupContainer },
      setup() {
        patchUserManagement();
        provide(CloseSettingsMenuKey, () => {});
      },
      template: `
        <div class="tw-w-[300px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-1">
          <story />
          <VcPopupContainer />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Settings menu action that opens change-password popup through popup-handler. Story includes popup container and safe user-management mocks for interactive preview.",
      },
    },
  },
} satisfies Meta<typeof ChangePasswordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
