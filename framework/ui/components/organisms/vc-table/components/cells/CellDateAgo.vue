<template>
  <span
    v-if="value"
    class="vc-table-cell-date-ago"
    :title="titleText"
  >
    {{ agoText }}
  </span>
  <span v-else class="vc-table-cell-date-ago vc-table-cell-date-ago--not-set">
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";

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
  return moment(props.value as string | number | Date).fromNow();
});
</script>

<style lang="scss">
.vc-table-cell-date-ago {
  @apply tw-truncate;
  color: var(--neutrals-400);

  &--not-set {
    color: var(--neutrals-400);
  }
}
</style>
