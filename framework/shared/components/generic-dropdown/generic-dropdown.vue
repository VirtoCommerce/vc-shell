<template>
  <VcDropdown
    :model-value="props.opened && !props.disabled"
    :items="props.items"
    :empty-text="props.emptyText"
    :item-text="props.itemText"
    :is-item-active="props.isItemActive"
    :floating="props.floating"
    :placement="props.placement"
    :variant="props.variant"
    :offset="props.offset"
    :max-height="props.maxHeight"
    @item-click="onItemClick"
    @update:model-value="onUpdateOpened"
  >
    <template
      v-if="$slots.trigger"
      #trigger="{ isActive, toggle, open, close }"
    >
      <slot
        name="trigger"
        :is-active="isActive"
        :toggle="toggle"
        :open="open"
        :close="close"
      />
    </template>

    <template
      v-if="$slots['items-container']"
      #items-container="{ items: slotItems, close }"
    >
      <slot
        name="items-container"
        :items="slotItems"
        :close="close"
      />
    </template>

    <template
      v-if="$slots.item"
      #item="{ item, click }"
    >
      <slot
        name="item"
        :item="item"
        :click="click"
      />
    </template>

    <template
      v-if="$slots.empty"
      #empty
    >
      <slot name="empty" />
    </template>
  </VcDropdown>
</template>

<script lang="ts" setup generic="T">
import { VcDropdown } from "../../../ui/components";

export interface Props<T> {
  opened?: boolean;
  disabled?: boolean;
  items: T[];
  emptyText?: string;
  itemText?: (item: T) => string;
  isItemActive?: (item: T) => boolean;
  floating?: boolean;
  placement?: "bottom" | "bottom-end" | "bottom-start" | "top" | "top-end" | "top-start";
  variant?: "default" | "secondary";
  offset?: {
    mainAxis?: number;
    crossAxis?: number;
  };
  maxHeight?: number | string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  opened: false,
  disabled: false,
  items: () => [],
  floating: false,
  placement: "bottom",
  variant: "default",
  maxHeight: 300,
  offset: () => ({
    mainAxis: 0,
    crossAxis: 0,
  }),
});

const emit = defineEmits<{
  (event: "item-click", item: T): void;
  (event: "update:opened", opened: boolean): void;
}>();

defineSlots<{
  item?: (args: { item: T; click: () => void }) => unknown;
  empty?: () => unknown;
  trigger?: (args: { isActive: boolean; toggle: () => void; open: () => void; close: () => void }) => unknown;
  "items-container"?: (args: { items: T[]; close: () => void }) => unknown;
}>();

function onUpdateOpened(value: boolean) {
  if (props.disabled) {
    emit("update:opened", false);
    return;
  }

  emit("update:opened", value);
}

function onItemClick(item: T) {
  if (props.disabled) {
    return;
  }

  emit("item-click", item);
}
</script>
