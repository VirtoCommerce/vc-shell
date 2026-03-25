<template>
  <SettingsMenuItem
    icon="lucide-key"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @trigger:click="handleClick"
  />
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { SettingsMenuItem } from "@shell/components/settings-menu-item";
import { usePopup } from "@core/composables/usePopup";
import { ChangePassword } from "@shell/components/change-password";

const { open } = usePopup({ component: ChangePassword });
const closeSettingsMenu = inject(CloseSettingsMenuKey, undefined);

const handleClick = () => {
  closeSettingsMenu?.();
  open();
};
</script>
