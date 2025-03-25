<template>
  <div
    class="vc-blade-toolbar"
    :class="{
      'vc-blade-toolbar--mobile': $isMobile.value,
    }"
  >
    <div class="vc-blade-toolbar__content">
      <VcBladeToolbarButtons
        :items="visibleItems"
        :is-expanded="isExpanded"
      />

      <slot
        v-if="slots['widgets-container']"
        name="widgets-container"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, useSlots } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { usePermissions } from "../../../../../../core/composables";
import { IBladeToolbar } from "./../../../../../../core/types";
import VcBladeToolbarButtons from "./_internal/vc-blade-toolbar-buttons/vc-blade-toolbar-buttons.vue";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const slots = useSlots();
const isExpanded = useLocalStorage("VC_BLADE_TOOLBAR_IS_EXPANDED", true);
const { hasAccess } = usePermissions();

const visibleItems = computed(() => {
  return props.items.filter(
    (item) => hasAccess(item.permissions) && (item.isVisible === undefined || item.isVisible) && !item.disabled,
  );
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 54px;
  --blade-toolbar-height-expanded: 54px;
  --blade-toolbar-background-color: var(--additional-50);
  --blade-toolbar-border-color: var(--neutrals-200);
  --blade-toolbar-icon-color: var(--neutrals-700);
  --blade-toolbar-icon-hover-color: var(--primary-600);
}

.vc-blade-toolbar {
  @apply tw-bg-[color:var(--blade-toolbar-background-color)] tw-border-b-[color:var(--blade-toolbar-border-color)] tw-border-solid tw-border-b tw-flex tw-box-border tw-w-full tw-content-center tw-items-stretch tw-shrink-0;

  &__content {
    @apply tw-flex tw-flex-row tw-w-full tw-relative tw-overflow-hidden tw-min-h-[var(--blade-toolbar-height)];
  }

  &--mobile {
    @apply tw-fixed tw-bottom-0 tw-right-0 tw-z-50 tw-p-4 tw-bg-transparent tw-border-0 tw-w-auto;
  }
}
</style>
