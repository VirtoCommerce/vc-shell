<template>
  <div
    class="tw-relative tw-w-[var(--app-menu-width)] tw-transition tw-duration-100 tw-pt-4"
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
        class="tw-text-[#319ed4] tw-flex tw-justify-end tw-items-center tw-p-4"
      >
        <VcIcon
          icon="fas fa-times"
          size="xl"
          @click="isMobileVisible = false"
        ></VcIcon>
      </div>

      <!-- Show scrollable area with menu items -->
      <VcContainer
        :noPadding="true"
        class="tw-grow tw-basis-0"
      >
        <div class="tw-gap-[5px] tw-flex tw-flex-col tw-px-4 tw-h-full">
          <template
            v-for="(item, index) in mobileMenuItems"
            :key="`info_item_${index}`"
          >
            <template v-if="item.isVisible === undefined || item.isVisible">
              <component
                v-if="item.component"
                :is="item.component"
                v-bind="item.bladeOptions"
                class="tw-p-0 tw-mb-2 tw-w-full tw-h-auto"
              ></component>
            </template>
          </template>
          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <VcAppMenuItem
              v-if="item.isVisible === undefined || item.isVisible"
              v-bind="item"
              :isVisible="item.isVisible as boolean"
              :title="item.title as string"
              @click="
                (navigationCb) => {
                  $emit('item:click', { item, navigationCb });
                  isMobileVisible = false;
                }
              "
              @child:click="
                ({ item: blade, navigationCb }) => {
                  $emit('item:click', { item: blade, navigationCb });
                  isMobileVisible = false;
                }
              "
            />
          </template>
          <div
            class="tw-text-[color:var(--app-menu-version-color)] tw-text-xs tw-mt-auto tw-self-center tw-p-1"
            @click="$emit('version:click')"
          >
            {{ version }}
          </div>
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import { VcContainer, VcIcon } from "./../../../../";
import { IMenuItems } from "./../../../../../../core/types";
import { IMenuClickEvent } from "./../../../../../../shared";

export interface Props {
  items?: IMenuItems[];
  mobileMenuItems?: IMenuItems[];
  version: string;
}

export interface Emits {
  (event: "item:click", { item, navigationCb }: IMenuClickEvent): void;
  (event: "version:click"): void;
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  mobileMenuItems: () => [],
  version: "",
});

defineEmits<Emits>();

const isMobileVisible = ref(false);

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
