import { defineComponent, onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UserDropdownButton from "@shared/components/user-dropdown-button/user-dropdown-button.vue";
import { ThemeSelector } from "@shared/components/theme-selector";
import { LanguageSelector } from "@shared/components/language-selector";
import { ChangePasswordButton } from "@shared/components/change-password-button";
import { LogoutButton } from "@shared/components/logout-button";
import { VcPopupContainer } from "@shared/components";
import { withMobileView } from "../../../../.storybook/decorators";
import { provideSettingsMenu } from "@core/composables/useSettingsMenu";
import { provideSidebarState } from "@core/composables/useSidebarState";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useRouter } from "vue-router";
import { IdentityResult, SecurityResult } from "@core/api/platform";

const MENU_ITEM_IDS = [
  "story-user-theme-selector",
  "story-user-language-selector",
  "story-user-change-password",
  "story-user-logout",
] as const;

function setupSettingsMenu() {
  const settingsMenu = provideSettingsMenu();

  MENU_ITEM_IDS.forEach((id) => settingsMenu.unregister(id));

  settingsMenu.register({
    id: "story-user-theme-selector",
    group: "preferences",
    order: 10,
    component: ThemeSelector,
  });
  settingsMenu.register({
    id: "story-user-language-selector",
    group: "preferences",
    order: 20,
    component: LanguageSelector,
  });
  settingsMenu.register({
    id: "story-user-change-password",
    group: "account",
    order: 30,
    component: ChangePasswordButton,
  });
  settingsMenu.register({
    id: "story-user-logout",
    group: "account",
    order: 100,
    component: LogoutButton,
  });

  onUnmounted(() => {
    MENU_ITEM_IDS.forEach((id) => settingsMenu.unregister(id));
  });
}

function patchUserManagement() {
  const userManagement = useUserManagement();
  const originalSignOut = userManagement.signOut;
  const originalValidatePassword = userManagement.validatePassword;
  const originalChangeUserPassword = userManagement.changeUserPassword;

  userManagement.signOut = async () => {};
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
    userManagement.signOut = originalSignOut;
    userManagement.validatePassword = originalValidatePassword;
    userManagement.changeUserPassword = originalChangeUserPassword;
  });
}

function ensureLoginRoute() {
  const router = useRouter();

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
}

const meta = {
  title: "Shared/UserDropdownButton",
  component: UserDropdownButton,
  tags: ["autodocs"],
  args: {
    name: "Emma Collins",
    role: "Vendor Manager",
    avatarUrl: "https://i.pravatar.cc/64?img=12",
    disabled: false,
  },
  decorators: [
    () => ({
      components: { VcPopupContainer },
      setup() {
        provideSidebarState();
        setupSettingsMenu();
        patchUserManagement();
        ensureLoginRoute();
      },
      template: `
        <div class="tw-w-[320px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50">
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
          "User account trigger used in shell sidebar/footer. Opens settings menu on desktop and sidebar variant on mobile. Story registers real menu items through settings-menu service.",
      },
    },
  },
} satisfies Meta<typeof UserDropdownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Mobile: Story = {
  decorators: [withMobileView],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
