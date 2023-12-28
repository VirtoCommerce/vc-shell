<template>
  <VcStatus v-bind="statusStyles">
    {{ $t(`IMPORT.PAGES.LIST.TABLE.STATUSES.${camelToSnake(statusText).toUpperCase()}`) }}</VcStatus
  >
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { IImportRunHistory } from "@vcmp-vendor-portal/api/marketplacevendor";
import { camelToSnake } from "@vc-shell/framework";

export interface Props {
  item: IImportRunHistory;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
});

const statusStyles = computed(
  (): {
    outline: boolean;
    variant: "warning" | "danger" | "success";
  } => {
    if (props.item.finished) {
      if (props.item.errorsCount && props.item.processedCount && props.item.errorsCount >= props.item.processedCount) {
        return {
          outline: false,
          variant: "danger",
        };
      } else if (
        props.item.errorsCount &&
        props.item.processedCount &&
        props.item.errorsCount < props.item.processedCount &&
        props.item.errorsCount > 0
      ) {
        return {
          outline: false,
          variant: "warning",
        };
      } else if (props.item.errorsCount === 0) {
        return {
          outline: false,
          variant: "success",
        };
      }
    }
    return {
      outline: true,
      variant: "warning",
    };
  },
);

const statusText = computed(() => {
  if (props.item.finished) {
    if (props.item.errorsCount && props.item.processedCount && props.item.errorsCount >= props.item.processedCount) {
      return "Failed";
    } else if (
      props.item.errorsCount &&
      props.item.processedCount &&
      props.item.errorsCount < props.item.processedCount &&
      props.item.errorsCount > 0
    ) {
      return "CompletedWithErrors";
    } else if (props.item.errorsCount === 0) {
      return "Completed";
    }
  }
  return "Cancelled";
});
</script>
