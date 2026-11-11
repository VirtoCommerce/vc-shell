<template>
  <span
    ref="root"
    class="vc-search-bar__chip"
    :class="{ 'vc-search-bar__chip--open': open }"
    :title="title"
  >
    <span
      v-if="field.kind === 'toggle'"
      class="vc-search-bar__chip-main"
    >
      <span class="vc-search-bar__chip-value">{{ field.label }}</span>
    </span>
    <button
      v-else
      type="button"
      class="vc-search-bar__chip-main"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :disabled="disabled"
      @click="emit('open', root!)"
    >
      <!-- the trailing space keeps "Field: value" in the accessible name -->
      <span class="vc-search-bar__chip-field">{{ `${field.label}: ` }}</span>
      <span class="vc-search-bar__chip-value">{{ label.text }}</span>
    </button>
    <button
      type="button"
      class="vc-search-bar__chip-x"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER', { label: field.label })"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <VcIcon
        icon="lucide-x"
        size="xs"
      />
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { chipLabel } from "../lib/values";
import type { SearchBarValue } from "../types";

const props = defineProps<{ field: BarField; value: SearchBarValue; open?: boolean; disabled?: boolean }>();
const emit = defineEmits<{ open: [anchor: HTMLElement]; remove: [] }>();
const { t } = useI18n({ useScope: "global" });

const root = ref<HTMLElement>();
const label = computed(() => chipLabel(props.field, props.value, t));
const title = computed(() =>
  props.field.kind === "toggle" ? props.field.label : `${props.field.label}: ${label.value.title}`,
);
</script>

<style lang="scss">
.vc-search-bar {
  &__chip {
    @apply tw-inline-flex tw-items-center tw-shrink-0 tw-whitespace-nowrap;
    height: 28px;
    border: 1px solid var(--primary-200);
    border-radius: 6px;
    background: var(--primary-50);
    color: var(--primary-700);
    font-size: 12.5px;

    &--open {
      background: var(--primary-100);
    }
  }
  &__chip-main {
    @apply tw-inline-flex tw-items-center tw-h-full tw-min-w-0;
    padding-inline-start: 8px;
  }
  &__chip-field {
    white-space: pre;
    opacity: 0.65;
  }
  &__chip-value {
    @apply tw-font-medium tw-truncate;
    max-width: 220px;
  }
  &__chip-x {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-h-full tw-rounded-r-md;
    width: 24px;

    &:hover:not(:disabled) {
      background: var(--primary-100);
    }
  }
}
</style>
