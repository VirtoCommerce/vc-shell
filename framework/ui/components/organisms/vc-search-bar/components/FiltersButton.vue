<template>
  <VcButtonGroup
    ref="root"
    class="vc-search-bar__filters-btn"
    :class="{
      'vc-search-bar__filters-btn--active': count > 0,
      'vc-search-bar__filters-btn--icon': mode === 'narrow',
      'vc-search-bar__filters-btn--open': open,
    }"
    attached
  >
    <VcButton
      class="vc-search-bar__filters-main"
      :variant="count > 0 ? 'tonal' : 'secondary'"
      :size="mode === 'narrow' ? 'icon' : 'default'"
      :selected="open"
      :aria-pressed="undefined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="
        (count > 0 ? $t(`${K}FILTERS_APPLIED`, { count }) : $t(`${K}FILTERS`)) + (showNames ? `: ${names}` : '')
      "
      :disabled="disabled"
      @click="emit('open', rootEl!)"
    >
      <VcIcon
        icon="lucide-funnel"
        :custom-size="16"
      />
      <span
        v-if="showNames"
        class="vc-search-bar__filters-names"
        >{{ names }}</span
      >
      <VcBadge
        v-if="count > 0"
        class="vc-search-bar__filters-badge"
        :content="count"
        size="s"
        :inline="mode !== 'narrow'"
        solid
        aria-hidden="true"
      />
    </VcButton>
    <VcButton
      v-if="count > 0 && mode !== 'narrow'"
      class="vc-search-bar__filters-x"
      variant="tonal"
      icon="lucide-x"
      icon-size="xs"
      :aria-pressed="undefined"
      :aria-label="$t(`${K}CLEAR_FILTERS`)"
      :disabled="disabled"
      @click="emit('clear')"
    />
  </VcButtonGroup>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import { VcBadge, VcButton, VcButtonGroup, VcIcon } from "@ui/components/atoms";
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

const root = ref<ComponentPublicInstance>();
const rootEl = computed(() => root.value?.$el as HTMLElement | undefined);
const showNames = computed(() => !!props.names && props.count > 0 && props.mode === "wide");
</script>

<style lang="scss">
.vc-search-bar {
  &__filters-btn {
    @apply tw-relative tw-shrink-0;
  }
  // active: a step darker border than a chip's
  &__filters-btn--active {
    --button-tonal-border-color: var(--primary-300);
    --button-tonal-border-color-hover: var(--primary-300);
  }
  &__filters-main {
    --button-default-padding-hor: 10px;
    @apply tw-min-w-0;

    // the title holds the funnel, the names and the count
    .vc-button__title {
      @apply tw-inline-flex tw-items-center tw-gap-1.5 tw-min-w-0;
    }
  }
  &__filters-main:focus-visible {
    @apply tw-relative tw-z-[1];
  }
  &__filters-names {
    @apply tw-truncate;
    max-width: 200px;
  }
  &__filters-x {
    --button-default-padding-hor: 8px;
  }
  // the count: an 18px primary-700 disc with a white number (in the dark theme too, where --additional-50 is a surface)
  &__filters-badge {
    --badge-size-small: 18px;
    --badge-background-color-primary: var(--primary-700);
    --badge-text-color: white;
  }
  // narrow: the count sits on the funnel's corner
  &__filters-btn--icon .vc-search-bar__filters-badge {
    @apply tw-absolute;
    top: 2px;
    inset-inline-end: 4px;
  }
}
// dark theme: --primary-300 is a surface there
:root[data-theme="dark"] .vc-search-bar__filters-btn--active {
  --button-tonal-border-color: color-mix(in srgb, var(--primary-500) 60%, transparent);
  --button-tonal-border-color-hover: color-mix(in srgb, var(--primary-500) 60%, transparent);
}
// dark: --primary-700 is a light blue there; white text needs the deeper --primary-400
:root[data-theme="dark"] .vc-search-bar__filters-badge {
  --badge-background-color-primary: var(--primary-400);
}
</style>
