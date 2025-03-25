<template>
  <!-- Filter button -->
  <VcTooltip
    ref="filterToggle"
    :delay="1000"
  >
    <VcButton
      text
      class="vc-table-filter__button"
      @click="openPanel"
    >
      <VcBadge
        :content="counter"
        size="s"
      >
        <div class="vc-table-filter__icon-container">
          <VcIcon
            class="vc-table-filter__icon"
            icon="fas fa-filter"
            size="m"
          />
        </div>
      </VcBadge>
    </VcButton>
    <template #tooltip>
      {{ title }}
    </template>
  </VcTooltip>
  <Sidebar
    :is-expanded="$isMobile.value ? isPanelVisible : false"
    position="left"
    render="mobile"
    @close="closePanel"
  >
    <template #header>
      <span />
    </template>
    <template #content>
      <div class="vc-table-filter">
        <!-- Filter panel -->
        <div
          v-if="isPanelVisible"
          ref="filterPanel"
          :class="panelClass"
          :style="filterStyle"
          @click.self="closePanel"
        >
          <div
            class="vc-table-filter__panel-inner"
            :class="{
              'vc-table-filter__panel-inner--desktop': $isDesktop.value,
            }"
            @click.stop
          >
            <div class="vc-table-filter__panel-header">
              <div class="vc-table-filter__panel-header-title">
                {{ title }}
              </div>
              <VcIcon
                class="vc-table-filter__panel-close"
                :icon="CrossSignIcon"
                size="xs"
                @click="closePanel"
              />
            </div>
            <slot :close-panel="closePanel"></slot>
          </div>
        </div>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { ref, watch, computed, inject, Ref } from "vue";
import { offset, autoUpdate, useFloating, UseFloatingReturn } from "@floating-ui/vue";
import { VcButton } from "./../../../../atoms/vc-button";
import { Sidebar } from "./../../../../../../shared/components";
import { VcBadge } from "./../../../../atoms/vc-badge";
import { VcTooltip } from "./../../../../atoms/vc-tooltip";
import { CrossSignIcon } from "./../../../../atoms/vc-icon/icons";

export interface Props {
  title?: string;
  counter?: number;
  parentExpanded?: boolean;
  disabled?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  counter: 0,
  parentExpanded: true,
});

const isPanelVisible = ref(false);
const filterToggle = ref<HTMLElement | null>();
const filterPanel = ref<HTMLElement | null>();
const isMobile = inject("isMobile") as Ref<boolean>;

const popper: UseFloatingReturn | undefined = !isMobile.value
  ? useFloating(filterToggle, filterPanel, {
      whileElementsMounted: autoUpdate,
      placement: "bottom-end",
      middleware: [offset(10)],
    })
  : undefined;

watch(
  () => props.parentExpanded,
  () => {
    closePanel();
  },
);

const filterStyle = computed(() => ({
  top: `${popper?.y.value ?? 0}px`,
  left: `${popper?.x.value ?? 0}px`,
}));

const panelClass = computed(() => {
  return isMobile.value ? "vc-table-filter__panel_mobile" : "vc-table-filter__panel";
});

function openPanel() {
  isPanelVisible.value = !isPanelVisible.value;
}

function closePanel() {
  isPanelVisible.value = false;
}
</script>

<style lang="scss">
:root {
  --table-filter-counter-bg: var(--additional-50);
  --table-filter-counter-text-color: var(--info-500);
  --table-filter-mobile-panel-overlay: var(--neutral-500);
  --table-filter-desktop-shadow-color: var(--additional-950);
  --table-filter-desktop-shadow: 1px 1px 11px rgb(from var(--table-filter-desktop-shadow-color) r g b / 7%);
  --table-filter-panel-bg: var(--additional-50);
  --table-filter-close-icon-color: var(--neutrals-500);
  --table-filter-panel-border-color: var(--neutrals-200);
  --table-filter-panel-header-title-color: var(--neutrals-600);
}

.vc-table-filter {
  @apply tw-relative tw-overflow-visible;

  &__button {
    @apply tw-p-0 #{!important};
  }

  &__icon-container {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__icon {
    @apply tw-text-[color:var(--widget-icon-color)];
  }

  &__title {
    @apply tw-font-medium tw-text-xs tw-text-[color:var(--widget-title-color)] tw-mt-1 tw-mx-0 tw-text-center tw-line-clamp-2;
  }

  &__button-content {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-[10px];
  }

  &__button-title {
    @apply tw-font-medium;
  }

  &__counter {
    @apply tw-rounded-[10px] tw-bg-[--table-filter-counter-bg] tw-text-[var(--table-filter-counter-text-color)] tw-h-5 tw-min-w-5 tw-leading-5 tw-text-center tw-font-medium;
  }

  &__panel_mobile {
    @apply tw-w-[300px];
    .vc-table-filter__panel {
      &-inner {
        @apply tw-w-full tw-h-full;
      }
    }

    .vc-row {
      @apply tw-block;
    }

    .vc-table-filter__panel-inner {
      @apply tw-bg-transparent;
    }
  }

  &__panel {
    @apply tw-absolute tw-max-w-[800px] tw-min-w-[400px] tw-w-0 tw-z-[100] [box-shadow:var(--table-filter-desktop-shadow)] tw-rounded-[3px] tw-overflow-hidden;
  }

  &__panel-inner {
    @apply tw-bg-[--table-filter-panel-bg] tw-box-border tw-flex tw-flex-col;

    &--desktop {
      box-shadow: var(--table-filter-desktop-shadow);
    }
  }

  &__panel-header {
    @apply tw-px-6 tw-py-[10px] tw-flex tw-flex-row tw-justify-between tw-items-center tw-border-b tw-border-solid tw-border-[var(--table-filter-panel-border-color)];
  }

  &__panel-header-title {
    @apply tw-text-sm tw-font-bold tw-text-[var(--table-filter-panel-header-title-color)];
  }

  &__panel-close {
    @apply tw-text-[var(--table-filter-close-icon-color)] tw-cursor-pointer tw-shrink-0;
  }
}
</style>
