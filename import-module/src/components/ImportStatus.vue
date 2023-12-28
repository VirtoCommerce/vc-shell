<template>
  <VcStatus v-bind="statusStyles">
    {{ t(`IMPORT.PAGES.LIST.TABLE.STATUSES.${camelToSnake(statusText).toUpperCase()}`) }}</VcStatus
  >
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { IImportRunHistory } from "./../api-client/import";
import { camelToSnake } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

export interface Props {
  item: IImportRunHistory;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
});

const { t } = useI18n({ useScope: "global" });

const statusStyles = computed(
  (): {
    outline: boolean;
    variant: "warning" | "danger" | "success";
  } => {
    if (props.item.finished && props.item.errorsCount >= props.item.processedCount) {
      return {
        outline: false,
        variant: "danger",
      };
    } else if (
      props.item.finished &&
      props.item.errorsCount < props.item.processedCount &&
      props.item.errorsCount > 0
    ) {
      return {
        outline: false,
        variant: "warning",
      };
    } else if (props.item.finished && props.item.errorsCount === 0) {
      return {
        outline: false,
        variant: "success",
      };
    }
    return (
      !props.item.finished && {
        outline: true,
        variant: "warning",
      }
    );
  },
);

const statusText = computed(() => {
  if (props.item.finished && props.item.errorsCount >= props.item.processedCount) {
    return "Failed";
  } else if (props.item.finished && props.item.errorsCount < props.item.processedCount && props.item.errorsCount > 0) {
    return "CompletedWithErrors";
  } else if (props.item.finished && props.item.errorsCount === 0) {
    return "Completed";
  }
  return !props.item.finished && "Cancelled";
});
</script>
