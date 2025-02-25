<template>
  <div class="vc-table-column-switcher">
    <div
      ref="referenceButton"
      class="vc-table-column-switcher__button-container"
    >
      <VcButton
        small
        icon="fas fa-th"
        class="vc-table-column-switcher__toggle-button"
        @click.stop="isActive = !isActive"
      ></VcButton>
    </div>
    <teleport to="body">
      <div
        v-if="isActive"
        ref="floatingDrop"
        v-on-click-outside="[close, { ignore: [referenceButton] }]"
        :style="floatingDropStyle"
        class="vc-table-column-switcher__dropdown"
      >
        <VcContainer
          v-if="internalItems && internalItems.length"
          :no-padding="true"
          class="vc-table-column-switcher__container"
        >
          <div class="vc-table-column-switcher__list">
            <div
              v-for="item in internalItems"
              :key="item.id"
              class="vc-table-column-switcher__item"
              @click="selectItem(item)"
            >
              <VcIcon
                :icon="item.visible ? 'fas fa-check' : ''"
                size="s"
                class="vc-table-column-switcher__item-icon"
              />
              <p class="vc-table-column-switcher__item-title">
                {{
                  $te(`COMPONENTS.ORGANISMS.VC_TABLE.${stateKey}.${item.id}`)
                    ? $t(`COMPONENTS.ORGANISMS.VC_TABLE.${stateKey}.${item.id}`)
                    : item.title
                }}
              </p>
            </div>
          </div>
        </VcContainer>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { ITableColumns } from "./../../../../../../core/types";
import { vOnClickOutside } from "@vueuse/components";
import { useFloating, flip, shift, autoUpdate } from "@floating-ui/vue";
import { TableColPartial } from "../../types";

export interface Props {
  items: TableColPartial[];
  stateKey: string;
}

export interface Emits {
  (event: "change", value: ITableColumns): void;
  (event: "onActive", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();

const isActive = ref(false);
const referenceButton = ref(null);
const floatingDrop = ref(null);
const internalItems = ref();
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

watch(
  () => props.items,
  (newVal) => {
    internalItems.value = newVal;
  },
  { immediate: true, deep: true },
);

watch(
  () => isActive.value,
  (newVal) => {
    emit("onActive", newVal);
  },
);

function selectItem(item: ITableColumns) {
  const numberVisible = internalItems.value.filter((i: ITableColumns) => i.visible).length;

  if (numberVisible > 1 || !item.visible) {
    emit("change", toggleVisibility(item));
  }
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

<style lang="scss">
:root {
  --table-column-switcher-dropdown-bg: var(--additional-50);
  --table-column-switcher-dropdown-border: var(--base-border-color, var(--neutrals-200));
  --table-column-switcher-dropdown-item-hover: var(--primary-50);
  --table-column-switcher-text-color: var(--base-text-color, var(--neutrals-950));
}

.vc-table-column-switcher {
  @apply tw-relative tw-w-min tw-float-right tw-mr-4;

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border tw-z-10 tw-overflow-hidden tw-absolute tw-border tw-border-solid tw-w-max tw-right-0;
    @apply tw-max-h-[300px] tw-h-auto;
    background-color: var(--table-column-switcher-dropdown-bg);
    border-color: var(--table-column-switcher-dropdown-border);
  }

  &__container {
    @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col;
  }

  &__item {
    @apply tw-flex tw-text-sm tw-items-center tw-box-border tw-cursor-pointer tw-border-b;
    @apply tw-min-h-[30px] tw-px-2 tw-rounded-[3px];
    @apply tw-bg-[--table-column-switcher-dropdown-bg];
    &:hover {
      @apply tw-bg-[--table-column-switcher-dropdown-item-hover];
    }
    border-color: var(--table-column-switcher-dropdown-border);
    color: var(--table-column-switcher-text-color);
  }

  &__item-icon {
    @apply tw-w-4;
  }

  &__item-title {
    @apply tw-ml-2;
  }
}
</style>
