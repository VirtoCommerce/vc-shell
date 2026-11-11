<template>
  <span
    ref="root"
    class="vc-search-bar__filters-btn"
    :class="{
      'vc-search-bar__filters-btn--active': count > 0,
      'vc-search-bar__filters-btn--icon': mode === 'narrow',
      'vc-search-bar__filters-btn--open': open,
    }"
  >
    <button
      type="button"
      class="vc-search-bar__filters-main"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="
        (count > 0 ? $t(`${K}FILTERS_APPLIED`, { count }) : $t(`${K}FILTERS`)) + (showNames ? `: ${names}` : '')
      "
      :disabled="disabled"
      @click="emit('open', root!)"
    >
      <VcIcon
        icon="lucide-funnel"
        size="s"
      />
      <span
        v-if="showNames"
        class="vc-search-bar__filters-names"
        >{{ names }}</span
      >
      <span
        v-if="count > 0"
        class="vc-search-bar__filters-badge"
        aria-hidden="true"
        >{{ count }}</span
      >
    </button>
    <button
      v-if="count > 0 && mode !== 'narrow'"
      type="button"
      class="vc-search-bar__filters-x"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.CLEAR_FILTERS')"
      :disabled="disabled"
      @click="emit('clear')"
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
import { VcIcon } from "@ui/components/atoms";
import type { BarMode } from "../composables/useBarMode";

const props = defineProps<{
  count: number;
  mode: BarMode;
  /** Applied field names (summary variant, wide mode) */
  names?: string;
  open?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{ open: [anchor: HTMLElement]; clear: [] }>();
const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.";

const root = ref<HTMLElement>();
const showNames = computed(() => !!props.names && props.count > 0 && props.mode === "wide");
</script>

<style lang="scss">
.vc-search-bar {
  &__filters-btn {
    @apply tw-relative tw-inline-flex tw-items-stretch tw-shrink-0;
    height: 36px;
    border: 1px solid var(--neutrals-300);
    border-radius: 8px;
    background: var(--additional-50);
    color: var(--neutrals-700);

    &--active {
      border-color: var(--primary-300);
      background: var(--primary-50);
      color: var(--primary-700);
    }
  }
  &__filters-main {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-gap-1.5 tw-min-w-0 tw-rounded-lg;
    min-width: 32px;
    font-size: 13px;

    &:disabled {
      @apply tw-cursor-not-allowed;
    }

    .vc-search-bar__filters-btn--active & {
      padding-inline: 10px;
    }
    &:hover:not(:disabled) {
      background: var(--neutrals-100);
    }
    .vc-search-bar__filters-btn--active &:hover:not(:disabled) {
      background: var(--primary-100);
    }
  }
  &__filters-names {
    @apply tw-truncate tw-font-medium;
    max-width: 200px;
  }
  &__filters-badge {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-font-semibold;
    height: 18px;
    min-width: 18px;
    padding-inline: 5px;
    font-size: 11px;
    background: var(--primary-600);
    color: var(--additional-50);
  }
  &__filters-x {
    @apply tw-inline-flex tw-items-center tw-justify-center;
    width: 32px;
    border-inline-start: 1px solid var(--primary-200);
    border-radius: 0 7px 7px 0;

    &:hover:not(:disabled) {
      background: var(--primary-100);
    }
  }
  // narrow: a 36px funnel with the badge on its corner
  &__filters-btn--icon {
    width: 36px;

    .vc-search-bar__filters-main {
      @apply tw-w-full;
      padding-inline: 0;
    }
    .vc-search-bar__filters-badge {
      @apply tw-absolute;
      top: -6px;
      right: -6px;
      height: 16px;
      min-width: 16px;
      padding-inline: 4px;
      font-size: 10.5px;
      box-shadow: 0 0 0 2px var(--additional-50);
    }
  }
}
</style>
