<template>
  <VcStatus :variant="status" :outline="false">
    {{ reviewStatus }}
  </VcStatus>
</template>

<script lang="ts" setup>
import { VcStatus } from "@vc-shell/framework";
import { computed } from "vue";
import { CustomerReviewStatus } from "../../../api_client/marketplacevendor";

export interface Props {
  reviewStatus?: CustomerReviewStatus;
}

const props = defineProps<Props>();

const status = computed(() => {
  let status = undefined;
  switch (props.reviewStatus) {
    case CustomerReviewStatus.New:
      status = "warning";
      break;
    case CustomerReviewStatus.Approved:
      status = "success";
      break;
    case CustomerReviewStatus.Rejected:
      status = "danger";
      break;
  }
  return status;
});
</script>
