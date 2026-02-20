<template>
  <div
    class="sidebar-content"
    :class="{ 'sidebar-content--no-header': !headerVisible }"
  >
    <VcScrollableContainer
      v-if="!disableMenu"
      ref="scrollContainer"
      class="sidebar-content__menu"
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
    </VcScrollableContainer>

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
import VcAppMenu from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";
import { VcScrollableContainer } from "@ui/components";
import { UserDropdownButton } from "@shared/components";
import { EmbeddedModeKey } from "@framework/injection-keys";
import type { MenuItem } from "@core/types";

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

const isEmbedded = inject(EmbeddedModeKey, false);

const scrollContainer = ref<InstanceType<typeof VcScrollableContainer> | null>(null);

onMounted(() => {
  nextTick(() => scrollContainer.value?.updateScrollState());
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
    @apply tw-flex-grow tw-min-h-0;

    .vc-scrollable-container__viewport {
      padding: 0 var(--app-bar-padding);
    }

    // Make nested containers transparent — the viewport is the sole scroll viewport
    .vc-app-menu,
    .vc-container {
      @apply tw-h-auto tw-overflow-visible;
    }

    .vc-container__inner {
      @apply tw-overflow-visible;
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
