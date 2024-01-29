<template>
  <div
    v-if="isMenuVisible"
    class="tw-relative tw-w-[var(--app-menu-width)] tw-transition tw-duration-100 tw-pt-[22px]"
    :class="{
      'vc-app-menu_mobile tw-hidden !tw-fixed !tw-left-0 !tw-top-0 !tw-w-full !tw-bottom-0 !tw-z-[9999]':
        $isMobile.value,
      '!tw-block': isMobileVisible,
    }"
  >
    <!-- Show backdrop overlay on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[9998] tw-bg-[#808c99] tw-opacity-60"
      @click="isMobileVisible = false"
    ></div>
    <div class="vc-app-menu__inner tw-flex tw-flex-col tw-h-full">
      <!-- Show menu close handler on mobile devices -->
      <div
        v-if="$isMobile.value"
        class="tw-text-[#319ed4] tw-flex tw-justify-end tw-items-center tw-p-4 tw-cursor-pointer"
      >
        <VcIcon
          icon="fas fa-times"
          size="xl"
          @click="isMobileVisible = false"
        ></VcIcon>
      </div>

      <!-- Show scrollable area with menu items -->
      <VcContainer
        :no-padding="true"
        class="tw-grow tw-basis-0"
      >
        <div class="tw-gap-[5px] tw-flex tw-flex-col tw-px-6 tw-h-full">
          <slot
            v-if="!$isDesktop.value"
            name="mobile"
          ></slot>

          <VcAppMenuItem
            v-for="item in menuItems"
            :key="item?.id"
            :is-visible="
              $hasAccess(item.permissions!) && (item.children?.some((child) => $hasAccess(child.permissions!)) ?? true)
            "
            :url="item.url"
            :icon="item.icon"
            :title="item.title as string"
            :children="item.children"
            @click="
              (event) => {
                $emit('item:click', event ? event : item);
                isMobileVisible = false;
              }
            "
          />
        </div>
      </VcContainer>
      <div
        class="tw-text-[color:var(--app-menu-version-color)] tw-text-xs tw-mt-auto tw-self-center tw-p-1"
        @click="$emit('version:click')"
      >
        {{ version }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import { VcContainer, VcIcon } from "./../../../../";
import { useMenuService } from "../../../../../../core/composables";
import { MenuItem } from "../../../../../../core/types";

export interface Props {
  version: string;
}

export interface Emits {
  (event: "item:click", item: MenuItem): void;
  (event: "version:click"): void;
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  mobileMenuItems: () => [],
  version: "",
});

defineEmits<Emits>();
const { menuItems } = useMenuService();

const isMobileVisible = ref(false);

const isMenuVisible = computed(() => {
  return !!menuItems.value.length;
});

defineExpose({
  isMobileVisible,
});
</script>

<style lang="scss">
:root {
  --app-menu-width: 230px;
  --app-menu-background-color: #ffffff;
  --app-menu-version-color: #838d9a;
}

.vc-app-menu {
  &_mobile &__inner {
    @apply tw-absolute tw-z-[9999] tw-right-0 tw-top-0 tw-bottom-0 tw-w-[300px] tw-max-w-[60%] tw-bg-[color:var(--app-menu-background-color)];
  }
}
</style>
