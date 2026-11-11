<template>
  <VcButtonGroup
    ref="root"
    class="vc-search-bar__chip"
    :class="{ 'vc-search-bar__chip--open': open }"
    :title="title"
    size="2xs"
    attached
  >
    <!-- a toggle has nothing to edit: its label is plain text in the chip's frame -->
    <span
      v-if="field.kind === 'toggle'"
      class="vc-search-bar__chip-main vc-search-bar__chip-static"
    >
      <span class="vc-search-bar__chip-value">{{ field.label }}</span>
    </span>
    <VcButton
      v-else
      class="vc-search-bar__chip-main"
      variant="tonal"
      :selected="open"
      :aria-pressed="undefined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :disabled="disabled"
      @click="emit('open', rootEl!)"
    >
      <!-- the trailing space keeps "Field: value" in the accessible name -->
      <span class="vc-search-bar__chip-field">{{ `${field.label}: ` }}</span>
      <span class="vc-search-bar__chip-value">{{ label.text }}</span>
    </VcButton>
    <VcButton
      class="vc-search-bar__chip-x"
      variant="tonal"
      icon="lucide-x"
      icon-size="xs"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER', { label: field.label })"
      :disabled="disabled"
      @click="emit('remove')"
    />
  </VcButtonGroup>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcButtonGroup } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { chipLabel } from "../lib/values";
import type { SearchBarValue } from "../types";

const props = defineProps<{ field: BarField; value: SearchBarValue; open?: boolean; disabled?: boolean }>();
const emit = defineEmits<{ open: [anchor: HTMLElement]; remove: [] }>();
const { t } = useI18n({ useScope: "global" });

const root = ref<ComponentPublicInstance>();
const rootEl = computed(() => root.value?.$el as HTMLElement | undefined);
const label = computed(() => chipLabel(props.field, props.value, t));
const title = computed(() =>
  props.field.kind === "toggle" ? props.field.label : `${props.field.label}: ${label.value.title}`,
);
</script>

<style lang="scss">
.vc-search-bar {
  &__chip {
    @apply tw-shrink-0 tw-whitespace-nowrap;

    .vc-button__title {
      @apply tw-inline-flex tw-min-w-0;
    }
  }
  &__chip-main {
    @apply tw-min-w-0 tw-font-normal;
  }
  // the toggle chip's label: the frame of a 2xs tonal button, without the button
  &__chip-static {
    @apply tw-inline-flex tw-items-center tw-text-xs tw-font-medium tw-box-border tw-border tw-border-solid
      tw-rounded-s-[var(--button-border-radius)];
    height: var(--button-2xs-height);
    padding-inline: var(--button-2xs-padding-hor);
    border-color: var(--button-tonal-border-color);
    background: var(--button-tonal-background-color);
    color: var(--button-tonal-text-color);
  }
  &__chip-field {
    white-space: pre;
    opacity: 0.65;
  }
  &__chip-value {
    @apply tw-font-medium tw-truncate;
    max-width: 220px;
  }
}
</style>
