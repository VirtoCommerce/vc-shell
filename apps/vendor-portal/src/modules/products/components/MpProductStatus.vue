<template>
  <vc-status
    v-bind="statusStyles[status]"
    v-for="(status, i) in statuses"
    :class="[$attrs.class, { 'vc-margin-right_xs': i < statuses.length - 1 }]"
    :key="i"
    >{{
      $t(`PRODUCTS.STATUSES.${camelToSnake(status).toUpperCase()}`)
    }}</vc-status
  >
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "MpProductStatus",
});
</script>

<script lang="ts" setup>
import { camelToSnake } from "@virtoshell/core";

const props = defineProps({
  status: {
    type: String,
    default: "None",
  },
});

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
const statuses = computed(() =>
  props.status
    .split(",")
    .map((item) => {
      return item.trim();
    })
    .filter((x) => x !== "Published")
);
</script>
