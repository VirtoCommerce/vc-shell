<template>
  <AppBarButtonTemplate
    :title="$t('COMPONENTS.NOTIFICATION_DROPDOWN.TITLE')"
    position="bottom-end"
    @toggle="onOpen"
  >
    <template #button>
      <div class="vc-notification-dropdown__button">
        <VcIcon
          :icon="BellIcon"
          size="l"
        />
        <div
          :class="{
            'vc-notification-dropdown__accent': hasUnreadNotifications,
          }"
        ></div>
      </div>
    </template>

    <template #dropdown-content="{ opened, toggle }">
      <Sidebar
        :is-expanded="$isMobile.value ? opened : false"
        position="right"
        render="mobile"
        @close="toggle"
      >
        <template #content>
          <GenericDropdown
            :opened="opened"
            :items="notifications"
            :empty-text="t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY')"
            :on-item-click="() => toggle()"
          >
            <template #item="{ item }">
              <NotificationItem
                :notification="item"
                :templates="notificationTemplates || []"
              />
            </template>
          </GenericDropdown>
        </template>
      </Sidebar>
    </template>
  </AppBarButtonTemplate>
</template>

<script lang="ts" setup>
import { inject, computed } from "vue";
import NotificationItem from "./_internal/notification/notification.vue";
import { VcIcon } from "../../../ui/components";
import { useI18n } from "vue-i18n";
import { NotificationTemplateConstructor } from "../../../core/types";
import { useNotifications } from "../../../core/composables";
import { AppBarButtonTemplate } from "./../app-bar-button";
import { Sidebar } from "./../sidebar";
import { GenericDropdown } from "../generic-dropdown";
import { BellIcon } from "./../../../ui/components/atoms/vc-icon/icons";

const notificationTemplates = inject<NotificationTemplateConstructor[]>("notificationTemplates");

const { t } = useI18n({ useScope: "global" });
const { notifications, markAllAsRead } = useNotifications();

const hasUnreadNotifications = computed(() => {
  return notifications.value.some((item) => item.isNew);
});

function onOpen(state: boolean) {
  if (state && notifications.value.some((x) => x.isNew)) {
    markAllAsRead();
  }
}
</script>

<style lang="scss">
:root {
  --notification-dropdown-accent-color: var(--danger-500);
  --notification-dropdown-button-width: var(--app-bar-button-width);
}

.vc-notification-dropdown {
  &__accent {
    @apply tw-block tw-absolute tw-right-[12px] tw-top-[30px] tw-w-[5px] tw-h-[5px] tw-bg-[--notification-dropdown-accent-color] tw-rounded-full tw-z-[1];
  }

  &__button {
    @apply tw-w-[var(--notification-dropdown-button-width)] tw-h-full tw-flex tw-items-center tw-justify-center tw-relative;
  }
}
</style>
