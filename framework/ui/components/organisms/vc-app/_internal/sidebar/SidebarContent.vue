<template>
  <div
    class="sidebar-content"
    :class="{ 'sidebar-content--no-header': !headerVisible }"
  >
    <template v-if="!disableMenu">
      <!-- Scroll up arrow -->
      <div
        class="sidebar-content__scroll-button"
        :class="{ 'sidebar-content__scroll-button--hidden': !canScrollUp }"
        aria-hidden="true"
        @pointerenter="startScroll('up')"
        @pointerleave="stopScroll"
      >
        <VcIcon
          icon="lucide-chevron-up"
          size="xs"
        />
      </div>

      <div
        ref="menuRef"
        class="sidebar-content__menu"
        @scroll="updateScrollState"
      >
        <slot
          name="menu"
          :expanded="expanded"
          :on-item-click="handleMenuItemClick"
        >
          <VcAppMenu
            :expanded="expanded"
            @item:click="handleMenuItemClick"
          />
        </slot>
      </div>

      <!-- Scroll down arrow -->
      <div
        class="sidebar-content__scroll-button"
        :class="{ 'sidebar-content__scroll-button--hidden': !canScrollDown }"
        aria-hidden="true"
        @pointerenter="startScroll('down')"
        @pointerleave="stopScroll"
      >
        <VcIcon
          icon="lucide-chevron-down"
          size="xs"
        />
      </div>
    </template>

    <div class="sidebar-content__footer">
      <slot
        name="sidebar-footer"
        :avatar="avatar"
        :name="userName"
        :role="userRole"
      >
        <UserDropdownButton
          v-if="!isEmbedded"
          :avatar-url="avatar"
          :name="userName"
          :role="userRole"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, onMounted, nextTick } from "vue";
import VcAppMenu from "../menu/VcAppMenu.vue";
import { VcIcon } from "../../../../";
import { UserDropdownButton } from "../../../../../../shared/components";
import { EMBEDDED_MODE } from "../../../../../../injection-keys";
import { useScrollArrows } from "../../../../../composables";
import type { MenuItem } from "../../../../../../core/types";

export interface Props {
  expanded?: boolean;
  avatar?: string;
  userName?: string;
  userRole?: string;
  disableMenu?: boolean;
  headerVisible?: boolean;
}

withDefaults(defineProps<Props>(), {
  expanded: true,
  disableMenu: false,
  headerVisible: true,
});

const emit = defineEmits<{
  (event: "item:click", item: MenuItem): void;
}>();

defineSlots<{
  menu?: (props: { expanded: boolean; onItemClick: (item: MenuItem) => void }) => unknown;
  "sidebar-footer"?: (props: { avatar?: string; name?: string; role?: string }) => unknown;
}>();

const isEmbedded = inject(EMBEDDED_MODE, false);

const menuRef = ref<HTMLElement | null>(null);
const { canScrollUp, canScrollDown, startScroll, stopScroll, updateScrollState } =
  useScrollArrows(menuRef);

onMounted(() => {
  nextTick(updateScrollState);
});

const handleMenuItemClick = (item: MenuItem) => {
  emit("item:click", item);
};
</script>

<style lang="scss">
.sidebar-content {
  @apply tw-flex tw-flex-col;
  height: calc(100% - var(--app-bar-height));

  &__menu {
    @apply tw-flex-grow tw-overflow-auto tw-min-h-0;
    padding: 0 var(--app-bar-padding);
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    // Make nested containers transparent — __menu is the sole scroll viewport
    .vc-app-menu,
    .vc-container {
      @apply tw-h-auto tw-overflow-visible;
    }

    .vc-container__inner {
      @apply tw-overflow-visible;
    }
  }

  &__scroll-button {
    @apply tw-flex tw-items-center tw-justify-center tw-py-1
      tw-cursor-default tw-shrink-0
      tw-text-[color:var(--neutrals-400)]
      tw-transition-opacity tw-duration-150;

    &--hidden {
      @apply tw-opacity-0 tw-pointer-events-none;
    }
  }

  &__footer {
    @apply tw-flex-none tw-mt-auto;
  }

  &--no-header {
    height: 100%;
  }

  &:before {
    content: "";
    @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px] tw-z-[1];
    background-color: var(--app-bar-border);
  }
}
</style>
