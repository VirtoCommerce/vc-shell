<template>
  <div class="vc-table-column-switcher">
    <VcDropdown
      :model-value="isActive"
      :items="internalItems"
      placement="bottom-end"
      floating
      max-height="40%"
      @item-click="selectItem"
      @update:model-value="(state) => emit('onActive', state)"
    >
      <template #trigger>
        <VcButton
          size="xs"
          icon-size="l"
          icon="material-view_column"
          class="vc-table-column-switcher__toggle-button"
          @click="isActive = !isActive"
        ></VcButton>
      </template>

      <template #item="{ item }">
        <div class="vc-table-column-switcher__item">
          <VcIcon
            :icon="item.visible ? 'material-check' : ''"
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
      </template>
    </VcDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { ITableColumns } from "@core/types";
import { TableColPartial } from "@ui/components/organisms/vc-table/types";
import { VcDropdown } from "@ui/components";

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
const internalItems = ref<ITableColumns[]>([]);

watch(
  () => props.items,
  (newVal) => {
    internalItems.value = newVal as ITableColumns[];
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
  const numberVisible = internalItems.value?.filter((i: ITableColumns) => i.visible).length || 0;

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
  --table-column-switcher-dropdown-border: var(--neutrals-200);
  --table-column-switcher-dropdown-item-hover: var(--primary-50);
  --table-column-switcher-text-color: var(--neutrals-950);
}

.vc-table-column-switcher {
  @apply tw-relative tw-w-min tw-float-right tw-mr-4 tw-h-full;

  &__item {
    @apply tw-flex tw-text-sm tw-items-center tw-box-border tw-cursor-pointer;
    @apply tw-w-full tw-px-3 tw-py-2;
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
