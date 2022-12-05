<template>
  <VcStatus
    v-bind="statusStyles[status]"
    v-for="(status, i) in statuses"
    :class="[$attrs.class, { 'mr-1': i < statuses.length - 1 }]"
    :key="i"
    >{{
      $t(`PRODUCTS.STATUSES.${camelToSnake(status).toUpperCase()}`)
    }}</VcStatus
  >
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { camelToSnake } from "@vc-shell/framework";

export interface Props {
  status: string;
}

const props = withDefaults(defineProps<Props>(), {
  status: "None",
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
