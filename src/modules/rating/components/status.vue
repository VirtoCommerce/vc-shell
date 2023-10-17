<template>
  <VcStatus
    :variant="status"
    :outline="false"
  >
    {{ reviewStatus }}
  </VcStatus>
</template>

<script lang="ts" setup>
import { VcStatus } from "@vc-shell/framework";
import { computed } from "vue";
import { CustomerReviewReviewStatus } from "vc-vendor-portal-api/marketplacevendor";

export interface Props {
  reviewStatus?: CustomerReviewReviewStatus;
}

const props = defineProps<Props>();

const status = computed(() => {
  let status = undefined;
  switch (props.reviewStatus) {
    case CustomerReviewReviewStatus.New:
      status = "warning";
      break;
    case CustomerReviewReviewStatus.Approved:
      status = "success";
      break;
    case CustomerReviewReviewStatus.Rejected:
      status = "danger";
      break;
  }
  return status;
});
</script>
