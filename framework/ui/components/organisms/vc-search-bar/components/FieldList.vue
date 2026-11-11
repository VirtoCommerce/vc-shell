<!-- Temporary field list for the Filters button and "+N"; FiltersPanel / FieldAccordion replace it -->
<template>
  <div class="vc-search-bar__menu">
    <button
      v-for="f in fields"
      :key="f.id"
      type="button"
      class="vc-search-bar__menu-item"
      :aria-pressed="f.kind === 'toggle' ? !isEmptyValue(values[f.id]) : undefined"
      @click="emit('pick', f)"
    >
      <span>{{ f.label }}</span>
      <span
        v-if="f.kind !== 'toggle' && !isEmptyValue(values[f.id])"
        class="vc-search-bar__menu-value"
        >{{ chipLabel(f, values[f.id], t).text }}</span
      >
      <VcIcon
        v-else-if="f.kind === 'toggle'"
        :icon="isEmptyValue(values[f.id]) ? 'lucide-square' : 'lucide-square-check'"
        size="xs"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { chipLabel, isEmptyValue } from "../lib/values";
import type { SearchBarValue } from "../types";

defineProps<{ fields: BarField[]; values: Record<string, SearchBarValue> }>();
const emit = defineEmits<{ pick: [field: BarField] }>();
const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss">
.vc-search-bar {
  &__menu {
    @apply tw-flex tw-flex-col tw-p-1;
  }
  &__menu-item {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-3 tw-text-sm tw-text-left tw-rounded tw-px-2 tw-py-1.5;
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__menu-value {
    @apply tw-truncate;
    max-width: 160px;
    color: var(--primary-700);
  }
}
</style>
