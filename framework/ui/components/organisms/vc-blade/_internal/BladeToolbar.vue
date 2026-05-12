<template>
  <div
    v-if="!(loading && isMobile)"
    class="vc-blade-toolbar"
    :class="{
      'vc-blade-toolbar--mobile': isMobile,
      'vc-blade-toolbar--loading': loading,
    }"
  >
    <div class="vc-blade-toolbar__content">
      <template v-if="loading">
        <div class="vc-blade-toolbar-skeleton__buttons">
          <div
            v-for="i in 3"
            :key="i"
            class="vc-blade-toolbar-skeleton__button"
          >
            <VcSkeleton
              variant="circle"
              :width="18"
              :height="18"
            />
            <VcSkeleton
              variant="block"
              :width="28 + i * 6"
              :height="10"
            />
          </div>
        </div>

        <div class="vc-blade-toolbar-skeleton__widgets">
          <div
            v-for="i in 2"
            :key="'w' + i"
            class="vc-blade-toolbar-skeleton__widget"
          >
            <VcSkeleton
              variant="circle"
              :width="18"
              :height="18"
            />
            <VcSkeleton
              variant="block"
              :width="30 + i * 4"
              :height="10"
              class="tw-mt-1"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="vc-blade-toolbar__buttons">
          <ToolbarMobile
            v-if="isMobile"
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
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import { useResponsive } from "@framework/core/composables/useResponsive";
import type { IBladeToolbar } from "@core/types";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import ToolbarMobile from "@ui/components/organisms/vc-blade/_internal/toolbar/ToolbarMobile.vue";
import ToolbarDesktop from "@ui/components/organisms/vc-blade/_internal/toolbar/ToolbarDesktop.vue";
import { useToolbarRegistration } from "@ui/components/organisms/vc-blade/_internal/composables/useToolbarRegistration";

export interface Props {
  items?: IBladeToolbar[];
  /** When true, renders skeleton placeholders instead of toolbar buttons/widgets */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const { isMobile } = useResponsive();
const isExpanded = true;
const { visibleItems } = useToolbarRegistration(toRef(props, "items"));
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 54px;
  --blade-toolbar-background-color: var(--neutrals-50);
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
    @apply tw-fixed tw-bottom-0 tw-right-0 tw-z-[var(--z-layout-sidebar)] tw-p-4 tw-bg-transparent tw-border-0 tw-w-auto;
  }
}

.vc-blade-toolbar-skeleton {
  &__buttons {
    @apply tw-flex tw-items-center tw-px-4 tw-flex-1 tw-min-w-0;
  }

  &__button {
    @apply tw-shrink-0 tw-px-3 tw-inline-flex tw-flex-col tw-items-center tw-gap-1;
  }

  &__widgets {
    @apply tw-flex tw-flex-row tw-gap-1 tw-shrink-0;
    background-color: var(--blade-toolbar-widgets-bg-color);
  }

  &__widget {
    @apply tw-shrink-0 tw-px-2 tw-py-1.5 tw-flex tw-flex-col tw-items-center tw-justify-center;
  }
}
</style>
