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
import { SettingsMenuItem } from "@shell/components/settings-menu-item";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useRouter } from "vue-router";
import { useBladeStack } from "@core/blade-navigation";

const { signOut } = useUserManagement();
const router = useRouter();
const { blades, closeBlade } = useBladeStack();
const closeSettingsMenu = inject(CloseSettingsMenuKey, undefined);

const handleLogout = async () => {
  closeSettingsMenu?.();
  while (blades.value.length > 1) {
    const activeChild = blades.value[blades.value.length - 1];
    const isPrevented = await closeBlade(activeChild.id);
    if (isPrevented) {
      return;
    }
  }

  await signOut();
  router.push({ name: "Login" });
};
</script>
