import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "../../../../core/composables";
import { useRouter } from "vue-router";
import { useBladeNavigation } from "../..";
import { usePopup } from "../../popup-handler/composables/usePopup";
import { ChangePassword } from "../../change-password";
import type { IMenuItem } from "../../../../core/types";
import { LogoutIcon, SettingsBoltIcon } from "../../../../ui/components/atoms/vc-icon/icons";

export function useUserActions() {
  const { t } = useI18n({ useScope: "global" });
  const { signOut } = useUser();
  const router = useRouter();
  const { closeBlade } = useBladeNavigation();
  const { open } = usePopup({ component: ChangePassword });

  const signOutButton = ref<IMenuItem>({
    title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
    icon: LogoutIcon,
    async clickHandler() {
      const isPrevented = await closeBlade(0);
      if (!isPrevented) {
        await signOut();
        router.push({ name: "Login" });
      }
    },
  });

  const changePasswordButton = ref<IMenuItem>({
    title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
    icon: SettingsBoltIcon,
    clickHandler() {
      open();
    },
  });

  const settingsButton = ref<IMenuItem>({
    title: computed(() => t("SHELL.ACCOUNT.SETTINGS")),
    icon: SettingsBoltIcon,
    clickHandler() {
      return true;
    },
  });

  const profileMenu = ref([settingsButton.value]);
  const defaultMenuItems = ref([changePasswordButton.value, signOutButton.value]);

  return {
    profileMenu,
    defaultMenuItems,
    signOutButton,
    changePasswordButton,
    settingsButton,
  };
}
