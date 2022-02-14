<template>
  <vc-status v-bind="statusStyles">
    {{
      $t(
        `IMPORT.PAGES.LIST.TABLE.STATUSES.${camelToSnake(
          statusText
        ).toUpperCase()}`
      )
    }}</vc-status
  >
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ImportRunHistory } from "../../../api_client";
import { camelToSnake } from "@virtoshell/core";

export default defineComponent({
  name: "ImportStatus",
  props: {
    item: {
      type: Object as PropType<ImportRunHistory>,
      default: () => ({}),
    },
  },
  setup(props) {
    const statusStyles = computed(() => {
      if (
        props.item.finished &&
        props.item.errorsCount >= props.item.processedCount
      ) {
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
    });

    const statusText = computed(() => {
      if (
        props.item.finished &&
        props.item.errorsCount >= props.item.processedCount
      ) {
        return "Failed";
      } else if (
        props.item.finished &&
        props.item.errorsCount < props.item.processedCount &&
        props.item.errorsCount > 0
      ) {
        return "CompletedWithErrors";
      } else if (props.item.finished && props.item.errorsCount === 0) {
        return "Completed";
      }
      return !props.item.finished && "Cancelled";
    });

    return {
      statusStyles,
      statusText,
      camelToSnake,
    };
  },
});
</script>

<style lang="less" scoped></style>
