<template>
  <SettingsMenuItem
    icon="lucide-log-out"
    :title="$t('SHELL.ACCOUNT.LOGOUT')"
    @trigger:click="handleLogout"
  />
</template>

<script lang="ts" setup>
import { SettingsMenuItem } from "../settings-menu-item";
import { useUserManagement } from "../../../core/composables/useUserManagement";
import { useRouter } from "vue-router";
import { useBladeNavigation } from "../blade-navigation";

const { signOut } = useUserManagement();
const router = useRouter();
const { closeBlade } = useBladeNavigation();

const handleLogout = async () => {
  const isPrevented = await closeBlade(0);
  if (!isPrevented) {
    await signOut();
    router.push({ name: "Login" });
  }
};
</script>
