<template>
  <SettingsMenuItem
    :icon="LogoutIcon"
    :title="$t('SHELL.ACCOUNT.LOGOUT')"
    @trigger:click="handleLogout"
  />
</template>

<script lang="ts" setup>
import { SettingsMenuItem } from "../settings-menu-item";
import { LogoutIcon } from "../../../ui/components/atoms/vc-icon/icons";
import { useUser } from "../../../core/composables";
import { useRouter } from "vue-router";
import { useBladeNavigation } from "../blade-navigation";

const { signOut } = useUser();
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
