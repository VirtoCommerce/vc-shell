<template>
  <span
    v-if="stacked && formatted"
    class="vc-table-cell-date vc-table-cell-date--stacked"
    :title="dateTimeFormat.full(dateValue)"
  >
    <span class="vc-table-cell-date__date">{{ dateTimeFormat.date(dateValue) }}</span>
    <span class="vc-table-cell-date__time">{{ dateTimeFormat.time(dateValue) }}</span>
  </span>
  <span
    v-else-if="value"
    class="vc-table-cell-date"
    :title="variant === 'date-time' && !format ? dateTimeFormat.full(dateValue) || undefined : undefined"
    >{{ formatted }}</span
  >
  <span
    v-else
    class="vc-table-cell-date vc-table-cell-date--not-set"
  >
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateWithPattern } from "@core/utilities/date";
import { useDateTimeFormat } from "@ui/composables/useDateTimeFormat";

const props = defineProps<{
  /** The date value to display (Date, string, or number) */
  value?: unknown;
  /** Format variant: 'date', 'time', or 'date-time' */
  variant?: "date" | "time" | "date-time";
  /** Custom date format string (moment.js tokens auto-converted) */
  format?: string;
  /** Date and time on one line instead of two (mobile cards). Only for the 'date-time' variant */
  inline?: boolean;
}>();

const { t } = useI18n({ useScope: "global" });
const locale = window.navigator.language;
const dateTimeFormat = useDateTimeFormat();

const dateValue = computed(() => props.value as Date | string | number | null | undefined);

// 'date-time' without a custom format: the date with the time under it, in the user's regional format and zone
const stacked = computed(
  () => props.variant === "date-time" && !props.format && !props.inline && !!dateTimeFormat.date(dateValue.value),
);

const formatted = computed(() => {
  if (!props.value) return "";

  // Custom date format
  if (props.format) {
    return formatDateWithPattern(props.value as string | number | Date, props.format, locale);
  }

  // Native locale formatting
  const d = props.value instanceof Date ? props.value : new Date(props.value as string | number);
  const variant = props.variant || "date";

  if (variant === "time") return d.toLocaleTimeString(locale);
  if (variant === "date-time") return dateTimeFormat.dateTime(dateValue.value) || String(props.value);
  return d.toLocaleDateString(locale);
});
</script>

<style lang="scss">
.vc-table-cell-date {
  @apply tw-truncate;
  color: var(--neutrals-400);

  &--not-set {
    color: var(--neutrals-400);
  }

  &--stacked {
    @apply tw-flex tw-flex-col tw-min-w-0;
  }

  &__date {
    @apply tw-truncate;
    color: var(--neutrals-600);
  }

  &__time {
    @apply tw-truncate tw-text-xs;
    color: var(--neutrals-500);
  }
}
</style>
