<template>
  <VcStatus
    v-if="context.item?.reviewStatus"
    :variant="status"
    :outline="false"
  >
    {{ context.item.reviewStatus ?? "" }}
  </VcStatus>
</template>

<script lang="ts" setup>
import { VcStatus } from "@vc-shell/framework";
import { computed } from "vue";
import { CustomerReviewReviewStatus } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: {
      reviewStatus: CustomerReviewReviewStatus;
    };
  };
}

const props = defineProps<Props>();

const status = computed(() => {
  let status = undefined;
  switch (props.context.item?.reviewStatus) {
    case CustomerReviewReviewStatus.New:
      status = "warning" as const;
      break;
    case CustomerReviewReviewStatus.Approved:
      status = "success" as const;
      break;
    case CustomerReviewReviewStatus.Rejected:
      status = "danger" as const;
      break;
  }
  return status;
});
</script>
