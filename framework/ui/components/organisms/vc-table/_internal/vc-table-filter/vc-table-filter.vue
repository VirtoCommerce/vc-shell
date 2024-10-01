<template>
  <!-- Filter button -->
  <VcButton
    ref="filterToggle"
    icon="fas fa-filter"
    icon-size="m"
    class="vc-table-filter__button"
    :disabled="disabled"
    @click="openPanel"
  >
    <template
      v-if="title || counter"
      #default
    >
      <div class="vc-table-filter__button-content">
        <span
          v-if="title"
          class="vc-table-filter__button-title"
        >
          {{ title }}
        </span>
        <div
          v-if="counter"
          class="vc-table-filter__counter"
        >
          {{ counter }}
        </div>
      </div>
    </template>
  </VcButton>
  <Sidebar
    :is-expanded="$isMobile.value ? isPanelVisible : false"
    position="left"
    render="mobile"
    @close="closePanel"
  >
    <template #content>
      <div class="vc-table-filter">
        <!-- Filter panel -->
        <teleport to="body">
          <div
            v-if="isPanelVisible"
            ref="filterPanel"
            :class="panelClass"
            :style="filterStyle"
            @click.self="closePanel"
          >
            <div
              class="vc-table-filter__panel-inner"
              @click.stop
            >
              <VcIcon
                class="vc-table-filter__panel-close"
                icon="fas fa-times"
                size="xl"
                @click="closePanel"
              />
              <slot :close-panel="closePanel"></slot>
            </div>
          </div>
        </teleport>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { ref, watch, computed, inject, Ref } from "vue";
import { offset, autoUpdate, useFloating, UseFloatingReturn } from "@floating-ui/vue";
import { VcButton } from "./../../../../atoms/vc-button";
import { Sidebar } from "./../../../../../../shared/components";

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
  --table-filter-close-icon-color: var(--info-500);
}

.vc-table-filter {
  @apply tw-relative tw-overflow-visible;

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

      &-close {
        @apply tw-self-start;
      }
    }

    .vc-row {
      @apply tw-block;
    }
  }

  &__panel {
    @apply tw-absolute tw-max-w-[800px] tw-min-w-[400px] tw-w-0 tw-z-[100] [box-shadow:var(--table-filter-desktop-shadow)] tw-rounded-[3px] tw-overflow-hidden;
  }

  &__panel-inner {
    @apply tw-bg-[--table-filter-panel-bg] tw-box-border tw-p-5 tw-flex tw-flex-col;
    box-shadow: var(--table-filter-desktop-shadow);
  }

  &__panel-close {
    @apply tw-text-[var(--table-filter-close-icon-color)] tw-cursor-pointer tw-self-end tw-shrink-0;
  }
}
</style>
