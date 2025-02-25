<template>
  <SettingsMenuItem
    :icon="SettingsBoltIcon"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @trigger:click="handleClick"
  />
</template>

<script lang="ts" setup>
import { SettingsMenuItem } from "../settings-menu-item";
import { SettingsBoltIcon } from "../../../ui/components/atoms/vc-icon/icons";
import { usePopup } from "../popup-handler/composables/usePopup";
import { ChangePassword } from "../change-password";

const { open } = usePopup({ component: ChangePassword });

const handleClick = () => {
  open();
};
</script>
