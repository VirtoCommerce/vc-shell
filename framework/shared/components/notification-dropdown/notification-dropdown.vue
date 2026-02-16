<template>
  <VcDropdown
    :model-value="true"
    :items="notifications"
    :empty-text="t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY')"
    max-height="auto"
  >
    <template #item="{ item }">
      <NotificationItem
        :notification="item"
        :templates="notificationTemplates || []"
      />
    </template>
  </VcDropdown>
</template>

<script lang="ts" setup>
import { inject, computed, onMounted } from "vue";
import NotificationItem from "./_internal/notification/notification.vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "../../../core/composables";
import { NotificationTemplatesSymbol } from "./../../../injection-keys";
import { VcDropdown } from "../../../ui/components";

const notificationTemplates = inject(NotificationTemplatesSymbol);

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

onMounted(() => {
  onOpen(hasUnreadNotifications.value);
});
</script>

<style lang="scss">
:root {
  --notification-dropdown-accent-color: var(--danger-500);
  --notification-dropdown-bell-color: var(--neutrals-500);
}

.vc-notification-dropdown {
  &__accent {
    @apply tw-block tw-absolute -tw-right-[4px] tw-top-[0px] tw-w-[5px] tw-h-[5px] tw-bg-[--notification-dropdown-accent-color] tw-rounded-full tw-z-[1];
  }

  &__button {
    @apply tw-flex tw-items-center tw-justify-center tw-relative;
  }

  &__button-icon {
    @apply tw-relative;

    &--mobile {
      @apply tw-text-[color:var(--notification-dropdown-bell-color)];
    }
  }

  &__item {
    @apply tw-py-[18px] tw-px-[15px] tw-border-b tw-border-solid
      tw-border-b-[var(--notification-dropdown-border-color)];
    transition: background-color 0.2s;

    &:last-of-type {
      @apply tw-border-b-0;
    }

    &--mobile:not(:last-of-type) {
      @apply tw-border-solid tw-border-b tw-border-b-[color:var(--notification-dropdown-divider-color)];
    }
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-items-center tw-p-4 tw-text-sm;
  }
}
</style>
