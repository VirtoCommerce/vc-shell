<template>
  <div class="tw-relative tw-w-min tw-float-right tw-mr-4">
    <div ref="referenceButton">
      <VcButton
        small
        icon="fas fa-bars"
        @click.stop="isActive = !isActive"
      ></VcButton>
    </div>
    <teleport to="body">
      <div
        v-if="isActive"
        ref="floatingDrop"
        v-on-click-outside="[close, { ignore: [referenceButton] }]"
        :style="floatingDropStyle"
        class="tw-flex tw-flex-col tw-box-border tw-max-h-[300px] tw-h-auto tw-z-10 tw-overflow-hidden tw-absolute tw-bg-white tw-border tw-border-solid tw-border-[#e5e7eb] tw-w-max tw-right-0"
      >
        <VcContainer
          v-if="items && items.length"
          :no-padding="true"
        >
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col">
            <div
              v-for="item in items"
              :key="item.id"
              class="tw-flex tw-items-center tw-min-h-[30px] tw-box-border tw-rounded-[3px] tw-px-2 tw-cursor-pointer hover:tw-bg-[#eff7fc] tw-border-b"
              :class="{ 'tw-bg-[#eff7fc]': item.visible }"
              @click="selectItem(item)"
            >
              {{ item.title }}
            </div>
          </div>
        </VcContainer>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { ITableColumns } from "./../../../../../../core/types";
import { vOnClickOutside } from "@vueuse/components";
import { useFloating, flip, shift, autoUpdate } from "@floating-ui/vue";

export interface Props {
  items: ITableColumns[];
}

export interface Emits {
  (event: "change", value: ITableColumns): void;
}

withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();

const isActive = ref(false);
const referenceButton = ref(null);
const floatingDrop = ref(null);
const floater = useFloating(referenceButton, floatingDrop, {
  placement: "bottom-end",
  whileElementsMounted: autoUpdate,
  middleware: [flip({ fallbackPlacements: ["top-end", "bottom-end"] }), shift({ mainAxis: false })],
});

const floatingDropStyle = computed(() => {
  return {
    top: `${floater.y.value ?? 0}px`,
    left: `${floater.x.value ?? 0}px`,
  };
});

function selectItem(item: ITableColumns) {
  emit("change", toggleVisibility(item));
}

function toggleVisibility(item: ITableColumns) {
  item.visible = !item.visible;
  return item;
}

function close() {
  if (isActive.value) {
    isActive.value = false;
  }
}
</script>
