<template>
  <div
    class="vc-blade-toolbar"
    :class="{
      'vc-blade-toolbar--mobile': $isMobile.value,
    }"
  >
    <div class="vc-blade-toolbar__content">
      <div class="vc-blade-toolbar__buttons">
        <ToolbarMobile
          v-if="$isMobile.value"
          :items="visibleItems"
        />
        <ToolbarDesktop
          v-else
          :items="visibleItems"
          :is-expanded="isExpanded"
        />
      </div>

      <slot
        v-if="$slots['widgets-container']"
        name="widgets-container"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import type { IBladeToolbar } from "../../../../../core/types";
import ToolbarMobile from "./toolbar/ToolbarMobile.vue";
import ToolbarDesktop from "./toolbar/ToolbarDesktop.vue";
import { useToolbarRegistration } from "./composables/useToolbarRegistration";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const isExpanded = true;
const { visibleItems } = useToolbarRegistration(toRef(props, "items"));
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

  &__buttons {
    @apply tw-relative tw-overflow-hidden tw-flex tw-flex-1 tw-min-w-0;
  }

  &--mobile {
    @apply tw-fixed tw-bottom-0 tw-right-0 tw-z-50 tw-p-4 tw-bg-transparent tw-border-0 tw-w-auto;
  }
}
</style>
