<template>
  <div class="tw-relative tw-overflow-visible">
    <!-- Filter button -->
    <div
      ref="filterToggle"
      class="tw-rounded-[3px] tw-bg-[#43b0e6] tw-flex tw-items-center tw-px-[10px] tw-text-white tw-h-[38px] tw-box-border tw-cursor-pointer"
      @click="openPanel"
    >
      <VcIcon
        icon="fas fa-filter"
        size="m"
      />
      <span
        v-if="title"
        class="tw-ml-[10px] tw-font-medium"
      >
        {{ title }}
      </span>
      <div
        v-if="counter"
        class="tw-ml-[10px] tw-rounded-[10px] tw-bg-white tw-text-[#43b0e6] tw-h-[20px] tw-min-w-[20px] tw-leading-[20px] tw-text-center tw-font-medium"
      >
        {{ counter }}
      </div>
    </div>

    <!-- Filter panel -->
    <teleport to="body">
      <div
        v-if="isPanelVisible"
        ref="filterPanel"
        :class="{
          'vc-table-filter__panel_mobile tw-fixed tw-left-0 tw-top-0 tw-w-full tw-bottom-0 tw-z-[100] tw-bg-[rgba(128,140,153,0.6)] tw-shadow-none tw-rounded-none tw-max-h-full tw-max-w-full tw-min-w-full':
            $isMobile.value,
          'vc-table-filter__panel tw-absolute tw-max-w-[800px] tw-min-w-[400px] tw-w-0 tw-z-[100] tw-shadow-[1px_1px_11px_rgba(141,152,163,0.6)] tw-rounded-[3px] tw-overflow-hidden':
            !$isMobile.value,
        }"
        :style="filterStyle"
        @click.self="closePanel"
      >
        <div
          class="vc-table-filter__panel-inner tw-bg-white tw-box-border tw-p-5 tw-flex tw-flex-col"
          @click.stop
        >
          <VcIcon
            class="vc-table-filter__panel-close tw-text-[#43b0e6] tw-cursor-pointer tw-self-end tw-shrink-0"
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

<script lang="ts" setup>
import { ref, watch, computed, inject, Ref } from "vue";
import { offset, autoUpdate, useFloating, UseFloatingReturn } from "@floating-ui/vue";

export interface Props {
  title?: string;
  counter: number;
  parentExpanded?: boolean;
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

function openPanel() {
  isPanelVisible.value = !isPanelVisible.value;
}

function closePanel() {
  isPanelVisible.value = false;
}
</script>

<style lang="scss">
.vc-table-filter {
  @apply tw-relative tw-overflow-visible;

  &__panel {
    &_mobile {
      .vc-table-filter__panel {
        &-inner {
          @apply tw-w-[280px] tw-h-full;
        }

        &-close {
          @apply tw-self-start;
        }
      }

      .vc-row {
        @apply tw-block;
      }
    }
  }
}
</style>
