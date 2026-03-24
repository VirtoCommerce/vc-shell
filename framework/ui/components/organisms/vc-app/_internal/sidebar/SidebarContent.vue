<template>
  <div
    class="sidebar-content"
    :class="{ 'sidebar-content--no-header': !headerVisible }"
  >
    <div
      v-if="showSearch && expanded"
      class="sidebar-content__search"
    >
      <VcInput
        v-model="searchQuery"
        :placeholder="searchPlaceholder || $t('SHELL.SIDEBAR.SEARCH_PLACEHOLDER', 'Search keyword')"
        size="small"
        clearable
        :debounce="300"
      />
    </div>

    <VcScrollableContainer
      v-if="!disableMenu"
      ref="scrollContainer"
      class="sidebar-content__menu"
    >
      <slot
        name="menu"
        :expanded="expanded"
        :on-item-click="handleMenuItemClick"
        :search-query="searchQuery"
      >
        <VcAppMenu
          :expanded="expanded"
          :search-query="searchQuery"
          @item:click="handleMenuItemClick"
        />
      </slot>
    </VcScrollableContainer>

    <div class="sidebar-content__footer">
      <!-- eslint-disable vue/no-duplicate-attributes -- slot name + scoped prop -->
      <slot
        name="sidebar-footer"
        :avatar="avatar"
        :name="userName"
        :role="userRole"
      >
        <!-- eslint-enable vue/no-duplicate-attributes -->
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
import { inject, ref, onMounted, nextTick, watch } from "vue";
import VcAppMenu from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";
import { VcScrollableContainer } from "@ui/components/atoms/vc-scrollable-container";
import { VcInput } from "@ui/components/molecules/vc-input";
import { UserDropdownButton } from "@shell/components/user-dropdown-button";
import { EmbeddedModeKey } from "@framework/injection-keys";
import type { MenuItem } from "@core/types";

export interface Props {
  expanded?: boolean;
  avatar?: string;
  userName?: string;
  userRole?: string;
  disableMenu?: boolean;
  headerVisible?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  disableMenu: false,
  headerVisible: true,
  showSearch: false,
});

const emit = defineEmits<{
  (event: "item:click", item: MenuItem): void;
}>();

defineSlots<{
  menu?: (props: { expanded: boolean; onItemClick: (item: MenuItem) => void; searchQuery: string }) => unknown;
  "sidebar-footer"?: (props: { avatar?: string; name?: string; role?: string }) => unknown;
}>();

const isEmbedded = inject(EmbeddedModeKey, false);

const scrollContainer = ref<InstanceType<typeof VcScrollableContainer> | null>(null);
const searchQuery = ref("");

onMounted(() => {
  nextTick(() => scrollContainer.value?.updateScrollState());
});

watch(
  () => props.expanded,
  (expanded) => {
    if (!expanded) searchQuery.value = "";
  },
);

const handleMenuItemClick = (item: MenuItem) => {
  searchQuery.value = "";
  emit("item:click", item);
};
</script>

<style lang="scss">
.sidebar-content {
  @apply tw-flex tw-flex-col;
  height: calc(100% - var(--app-bar-height));

  &__search {
    @apply tw-flex-none tw-px-[18px] tw-py-[11px];
    background-color: var(--secondary-50);
    border-bottom: 1px solid var(--neutrals-200);
    border-top: 1px solid var(--neutrals-200);
  }

  &__menu {
    @apply tw-flex-grow tw-min-h-0 tw-pt-[14px];

    // Make nested containers transparent — the viewport is the sole scroll viewport
    .vc-menu,
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
