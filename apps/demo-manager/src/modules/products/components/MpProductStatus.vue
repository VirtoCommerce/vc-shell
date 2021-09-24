<template>
  <vc-status
    v-bind="statusStyles[status]"
    v-for="(status, i) in statuses"
    :key="i"
    >{{
      $t(`PRODUCTS.STATUSES.${camelToSnake(status).toUpperCase()}`)
    }}</vc-status
  >
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { camelToSnake } from "@virtoshell/core";

export default defineComponent({
  name: "MpProductStatus",

  props: {
    status: {
      type: String,
      default: "None",
    },
  },

  setup(props) {
    const statusStyles = {
      RequestChanges: {
        outline: true,
        variant: "danger",
      },
      Approved: {
        outline: true,
        variant: "success",
      },
      WaitForApproval: {
        outline: true,
        variant: "warning",
      },
      Rejected: {
        outline: false,
        variant: "danger",
      },
      HasStagedChanges: {
        outline: true,
        variant: "warning",
      },
      Published: {
        outline: false,
        variant: "success",
      },
    };
    return {
      statuses: computed(() =>
        props.status.split(",").map(function (item) {
          return item.trim();
        })
      ),
      statusStyles,
      camelToSnake,
    };
  },
});
</script>
