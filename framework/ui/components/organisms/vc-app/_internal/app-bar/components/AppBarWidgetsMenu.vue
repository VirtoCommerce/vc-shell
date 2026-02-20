<template>
  <div class="vc-app-toolbar-menu">
    <div
      v-for="item in items"
      :key="item.id"
      class="vc-app-toolbar-menu__item"
    >
      <AppBarWidgetItem
        v-if="item.component"
        :widget-id="item.id"
        @toggle="item.onClick && item.onClick()"
      >
        <template #trigger="{ isActive }">
          <div class="vc-app-toolbar-menu__button">
            <div
              class="vc-app-toolbar-menu__button-icon"
              :class="{
                'vc-app-toolbar-menu__button-icon--active': isActive,
              }"
            >
              <VcIcon
                v-if="item.icon"
                :icon="item.icon"
                size="l"
              />
              <div
                v-if="isBadgeActive(item)"
                class="vc-app-toolbar-menu__accent"
              ></div>
            </div>
          </div>
        </template>
      </AppBarWidgetItem>

      <AppBarWidgetItem
        v-else-if="item.onClick"
        :widget-id="item.id"
        @toggle="item.onClick"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-app-toolbar-menu__button-icon"
            :class="{
              'vc-app-toolbar-menu__button-icon--active': isActive,
            }"
          >
            <VcIcon
              v-if="item.icon"
              :icon="item.icon"
              size="l"
            />
            <div
              v-if="isBadgeActive(item)"
              class="vc-app-toolbar-menu__accent"
            ></div>
          </div>
        </template>
      </AppBarWidgetItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppBarWidgetItem from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppBarWidgetItem.vue";
import { VcIcon } from "@ui/components";
import { useAppBarWidget } from "@core/composables";
import type { AppBarWidget } from "@core/services";

const { items } = useAppBarWidget();

function isBadgeActive(item: AppBarWidget): boolean {
  if (item.badge === undefined) {
    return false;
  }

  if (typeof item.badge === "function") {
    return item.badge();
  }

  return !!item.badge;
}
</script>

<style lang="scss">
:root {
  --app-toolbar-menu-accent-color: var(--danger-500);
  --app-toolbar-menu-icon-color: var(--neutrals-500);
  --app-toolbar-menu-icon-color-active: var(--primary-500);
}

.vc-app-toolbar-menu {
  @apply tw-flex tw-items-center;

  &__accent {
    @apply tw-block tw-absolute -tw-right-[4px] tw-top-[0px] tw-w-[5px] tw-h-[5px] tw-bg-[--app-toolbar-menu-accent-color] tw-rounded-full tw-z-[1];
  }

  &__button {
    @apply tw-flex tw-items-center tw-justify-center tw-relative tw-cursor-pointer;
  }

  &__button-icon {
    @apply tw-relative tw-text-[color:var(--app-toolbar-menu-icon-color)];

    &--active {
      @apply tw-text-[color:var(--app-toolbar-menu-icon-color-active)];
    }
  }
}
</style>
