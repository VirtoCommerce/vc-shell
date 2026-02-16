<template>
  <span v-if="value" class="vc-table-cell-date">{{ formatted }}</span>
  <span v-else class="vc-table-cell-date vc-table-cell-date--not-set">
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";

const props = defineProps<{
  /** The date value to display (Date, string, or number) */
  value?: unknown;
  /** Format variant: 'date', 'time', or 'date-time' */
  variant?: "date" | "time" | "date-time";
  /** Custom moment.js format string (overrides variant) */
  format?: string;
}>();

const { t } = useI18n({ useScope: "global" });
const locale = window.navigator.language;

const formatted = computed(() => {
  if (!props.value) return "";

  // Custom moment format
  if (props.format) {
    return moment(props.value as string | number | Date)
      .locale(locale)
      .format(props.format);
  }

  // Native locale formatting
  const d = props.value instanceof Date ? props.value : new Date(props.value as string | number);
  const variant = props.variant || "date";

  if (variant === "time") return d.toLocaleTimeString(locale);
  if (variant === "date-time") return d.toLocaleString(locale);
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
}
</style>
