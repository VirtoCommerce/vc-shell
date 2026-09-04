<template>
  <span
    v-if="value"
    class="vc-table-cell-date-ago"
    :title="titleText"
  >
    {{ agoText }}
  </span>
  <span
    v-else
    class="vc-table-cell-date-ago vc-table-cell-date-ago--not-set"
  >
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateRelative } from "@core/utilities/date";

const props = defineProps<{
  /** The date value to display as relative time (e.g., '2 hours ago') */
  value?: unknown;
}>();

const { t } = useI18n({ useScope: "global" });
const locale = window.navigator.language;

const titleText = computed(() => {
  if (!props.value) return "";
  const d = props.value instanceof Date ? props.value : new Date(props.value as string | number);
  return d.toLocaleString(locale);
});

const agoText = computed(() => {
  if (!props.value) return "";
  return formatDateRelative(props.value as string | number | Date);
});
</script>

<style lang="scss">
.vc-table-cell-date-ago {
  @apply tw-truncate;
  // -600 rather than -500: this text also lands on the selected-row tint, where
  // -500 is 3.94:1. -600 clears AA on both (7.81:1 on white, 6.49:1 selected).
  color: var(--neutrals-600);

  &--not-set {
    color: var(--neutrals-600);
  }
}
</style>
