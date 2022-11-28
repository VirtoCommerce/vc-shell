<template>
  <div class="relative overflow-visible">
    <!-- Filter button -->
    <div
      class="rounded-[3px] bg-[#43b0e6] flex items-center px-[10px] text-white h-[38px] box-border cursor-pointer"
      @click="openPanel($isMobile.value)"
      ref="filterToggle"
    >
      <VcIcon icon="fas fa-filter" size="m" />
      <span v-if="title" class="ml-[10px] font-medium">
        {{ title }}
      </span>
      <div
        v-if="counter"
        class="ml-[10px] rounded-[10px] bg-white text-[#43b0e6] h-[20px] min-w-[20px] leading-[20px] text-center font-medium"
      >
        {{ counter }}
      </div>
    </div>

    <!-- Filter panel -->
    <teleport to="body">
      <div
        :class="{
          'vc-table-filter__panel_mobile fixed left-0 top-0 w-full bottom-0 z-[9999] bg-[rgba(128,140,153,0.6)] shadow-none rounded-none max-h-full max-w-full min-w-full':
            $isMobile.value,
          'vc-table-filter__panel absolute max-h-[400px] max-w-[800px] min-w-[400px] z-[100] shadow-[1px_1px_11px_rgba(141,152,163,0.6)] rounded-[3px] overflow-hidden':
            !$isMobile.value,
        }"
        v-if="isPanelVisible"
        @click.self="closePanel"
        ref="filterPanel"
      >
        <div
          class="vc-table-filter__panel-inner bg-white box-border p-5 flex flex-col"
          @click.stop
        >
          <VcIcon
            class="vc-table-filter__panel-close text-[#43b0e6] cursor-pointer self-end shrink-0"
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
import { VcIcon } from "@components";

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
  @apply relative overflow-visible;

  &__panel {
    &_mobile {
      .vc-table-filter__panel {
        &-inner {
          @apply w-[280px] h-full;
        }

        &-close {
          @apply self-start;
        }
      }

      .vc-row {
        @apply block;
      }
    }
  }
}
</style>
