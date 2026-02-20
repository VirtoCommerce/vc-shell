<template>
  <div class="vc-accordion" :class="`vc-accordion--${variant}`">
    <VcAccordionItem
      v-for="(item, index) in items"
      :key="item.id || index"
      :title="item.title"
      :collapsed-height="item.collapsedHeight ?? collapsedHeight"
      :max-expanded-height="item.maxExpandedHeight ?? maxExpandedHeight"
      :is-expanded="isItemExpanded(item.id || index)"
      :disabled="item.disabled"
      class="vc-accordion__item"
      @toggle="(expanded) => handleToggle(item.id || index, expanded)"
    >
      <template v-if="item.titleSlot" #title>
        <component :is="item.titleSlot" />
      </template>
      <template v-if="typeof item.content === 'string'">
        {{ item.content }}
      </template>
      <component v-else-if="item.content" :is="item.content" />
    </VcAccordionItem>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import VcAccordionItem from "@ui/components/molecules/vc-accordion/_internal/vc-accordion-item/vc-accordion-item.vue";
import type { Component } from "vue";

export interface AccordionItem {
  id?: string | number;
  title: string;
  content?: string | Component;
  titleSlot?: Component;
  collapsedHeight?: number;
  maxExpandedHeight?: number;
  disabled?: boolean;
}

export interface Props {
  items?: AccordionItem[];
  modelValue?: (string | number) | (string | number)[];
  multiple?: boolean;
  variant?: "default" | "bordered" | "separated";
  collapsedHeight?: number;
  maxExpandedHeight?: number;
}

export interface Emits {
  (event: "update:modelValue", value: (string | number) | (string | number)[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  multiple: false,
  variant: "default",
  collapsedHeight: 0,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "VcAccordion",
});

defineSlots<{
  default: (props?: any) => any;
}>();

const expandedItems = ref<(string | number)[]>([]);

const isItemExpanded = computed(() => {
  return (id: string | number) => expandedItems.value.includes(id);
});

function handleToggle(id: string | number, expanded: boolean) {
  if (expanded) {
    if (props.multiple) {
      expandedItems.value.push(id);
    } else {
      expandedItems.value = [id];
    }
  } else {
    expandedItems.value = expandedItems.value.filter((itemId) => itemId !== id);
  }

  emitModelValue();
}

function emitModelValue() {
  if (props.multiple) {
    emit("update:modelValue", expandedItems.value);
  } else {
    emit("update:modelValue", expandedItems.value[0] ?? null);
  }
}

function initializeExpandedItems() {
  if (props.modelValue !== undefined && props.modelValue !== null) {
    if (Array.isArray(props.modelValue)) {
      expandedItems.value = [...props.modelValue];
    } else {
      expandedItems.value = [props.modelValue];
    }
  } else {
    expandedItems.value = [];
  }
}

watch(
  () => props.modelValue,
  () => {
    initializeExpandedItems();
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vc-accordion {
  display: flex;
  flex-direction: column;

  &--default {
    gap: 0;

    .vc-accordion__item {
      border-bottom: 1px solid var(--accordion-item-border-color);

      &:first-child {
        border-top: 1px solid var(--accordion-item-border-color);
      }

      &:not(:first-child) {
        .vc-accordion-item {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
      }

      &:not(:last-child) {
        .vc-accordion-item {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
    }
  }

  &--bordered {
    border: 1px solid var(--accordion-item-border-color);
    border-radius: var(--accordion-item-border-radius);
    overflow: hidden;

    .vc-accordion__item {
      &:not(:last-child) {
        border-bottom: 1px solid var(--accordion-item-border-color);
      }

      .vc-accordion-item {
        border-radius: 0;
      }
    }
  }

  &--separated {
    gap: 12px;

    .vc-accordion__item {
      border: 1px solid var(--accordion-item-border-color);
    }
  }
}
</style>
