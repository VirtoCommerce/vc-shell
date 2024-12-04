<template>
  <AppBarButtonTemplate
    :title="$t('COMPONENTS.NOTIFICATION_DROPDOWN.TITLE')"
    position="bottom-end"
    @toggle="onOpen"
  >
    <template #button>
      <div class="vc-notification-dropdown__button">
        <VcIcon
          icon="fas fa-bell"
          size="xl"
        ></VcIcon>
        <div
          :class="{
            'vc-notification-dropdown__accent': isAccent,
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
          <div
            v-if="opened"
            :class="[
              'vc-notification-dropdown__dropdown',
              { 'vc-notification-dropdown__dropdown--mobile': $isMobile.value },
            ]"
          >
            <VcContainer
              :no-padding="true"
              @click.stop
            >
              <VcCol v-if="notifications && notifications.length">
                <div
                  v-for="item in notifications"
                  :key="`notification_${item.id}`"
                  class="vc-notification-dropdown__item"
                  :class="{
                    'vc-notification-dropdown__item--mobile': $isMobile.value,
                  }"
                >
                  <NotificationItem
                    :notification="item"
                    :templates="notificationTemplates || []"
                    @on-click="toggle"
                  />
                </div>
              </VcCol>
              <div
                v-else
                class="vc-notification-dropdown__empty"
              >
                {{ t("COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY") }}
              </div>
            </VcContainer>
          </div>
        </template>
      </Sidebar>
    </template>
  </AppBarButtonTemplate>
</template>

<script lang="ts" setup>
import { inject, computed } from "vue";
import NotificationItem from "./_internal/notification/notification.vue";
import { VcCol, VcContainer, VcIcon } from "../../../ui/components";
import { useI18n } from "vue-i18n";
import { NotificationTemplateConstructor } from "../../../core/types";
import { useNotifications } from "../../../core/composables";
import { AppBarButtonTemplate } from "./../app-bar-button";
import { Sidebar } from "./../sidebar";

const notificationTemplates = inject<NotificationTemplateConstructor[]>("notificationTemplates");

const { t } = useI18n({ useScope: "global" });
const { notifications, markAllAsRead } = useNotifications();

const isAccent = computed(() => {
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
  --notification-dropdown-border-color: var(--additional-50);
  --notification-dropdown-bg-color: var(--additional-50);
  --notification-dropdown-accent-color: var(--danger-500);
  --notification-dropdown-button-width: var(--app-bar-button-width);
  --notification-dropdown-divider-color: var(--base-border-color, var(--neutrals-200));
}

.vc-notification-dropdown {
  &__accent {
    @apply tw-block tw-absolute tw-right-[12px] tw-top-[18px] tw-w-[7px] tw-h-[7px] tw-bg-[--notification-dropdown-accent-color] tw-rounded-full tw-z-[1];
  }

  &__dropdown {
    @apply tw-bg-[--notification-dropdown-bg-color] tw-rounded-b-[6px] tw-w-[439px]
      tw-max-h-[350px] tw-min-h-[50px] tw-overflow-hidden tw-flex tw-flex-col;

    &--mobile {
      @apply tw-max-h-full tw-w-full;
      display: flex !important;
    }
  }

  &__button {
    @apply tw-w-[var(--notification-dropdown-button-width)] tw-h-full tw-flex tw-items-center tw-justify-center tw-relative;
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
