<template>
  <div class="tw-relative tw-overflow-visible">
    <!-- Filter button -->
    <div
      class="tw-rounded-[3px] tw-bg-[#43b0e6] tw-flex tw-items-center tw-px-[10px] tw-text-white tw-h-[38px] tw-box-border tw-cursor-pointer"
      @click="openPanel($isMobile.value)"
      ref="filterToggle"
    >
      <VcIcon icon="fas fa-filter" size="m" />
      <span v-if="title" class="tw-ml-[10px] tw-font-medium">
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
        :class="{
          'vc-table-filter__panel_mobile tw-fixed tw-left-0 tw-top-0 tw-w-full tw-bottom-0 tw-z-[9999] tw-bg-[rgba(128,140,153,0.6)] tw-shadow-none tw-rounded-none tw-max-h-full tw-max-w-full tw-min-w-full':
            $isMobile.value,
          'vc-table-filter__panel tw-absolute tw-max-h-[400px] tw-max-w-[800px] tw-min-w-[400px] tw-z-[100] tw-shadow-[1px_1px_11px_rgba(141,152,163,0.6)] tw-rounded-[3px] tw-overflow-hidden':
            !$isMobile.value,
        }"
        v-if="isPanelVisible"
        @click.self="closePanel"
        ref="filterPanel"
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

          <slot :closePanel="closePanel"></slot>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, watch } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import { createPopper, Instance } from "@popperjs/core";
import { VcIcon } from "./../../../../../components";

export interface Props {
  title: string;
  counter: number;
  parentExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  counter: 0,
  parentExpanded: true,
});

const isPanelVisible = ref(false);
const filterToggle = ref();
const filterPanel = ref();
const popper = ref<Instance>();

watch(
  () => props.parentExpanded,
  () => {
    closePanel();
  }
);

function openPanel(isMobile: boolean) {
  isPanelVisible.value = !isPanelVisible.value;

  if (!isMobile) {
    const element = document.querySelector(".vc-blade");
    if (isPanelVisible.value) {
      nextTick(() => {
        popper.value = createPopper(filterToggle.value, filterPanel.value, {
          placement: "bottom-end",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
            {
              name: "preventOverflow",
              options: {
                boundary: element,
              },
            },
          ],
        });
      });
    } else {
      destroyPopper();
    }
  }
}

function closePanel() {
  isPanelVisible.value = false;
  destroyPopper();
}

function destroyPopper() {
  // To prevent memory leaks Popper needs to be destroyed.
  popper.value?.destroy();
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
