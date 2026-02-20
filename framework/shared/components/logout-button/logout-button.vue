<template>
  <SettingsMenuItem
    icon="lucide-log-out"
    :title="$t('SHELL.ACCOUNT.LOGOUT')"
    @trigger:click="handleLogout"
  />
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { SettingsMenuItem } from "@shared/components/settings-menu-item";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useRouter } from "vue-router";
import { useBladeNavigation } from "@shared/components/blade-navigation";

const { signOut } = useUserManagement();
const router = useRouter();
const { closeBlade } = useBladeNavigation();
const closeSettingsMenu = inject(CloseSettingsMenuKey, undefined);

const handleLogout = async () => {
  closeSettingsMenu?.();
  const isPrevented = await closeBlade(0);
  if (!isPrevented) {
    await signOut();
    router.push({ name: "Login" });
  }
};
</script>
