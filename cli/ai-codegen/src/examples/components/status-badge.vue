<template>
  <div class="tw-flex">
    <VcStatus
      v-bind="statusStyle(status)"
      :dot="$isMobile.value"
    >
      {{ status }}
    </VcStatus>
  </div>
</template>

<script lang="ts" setup>
/**
 * StatusBadge Component
 * 
 * Displays a status badge with appropriate styling based on status value.
 * Used in table columns for visual status representation.
 * 
 * Usage in VcTable:
 * <template #item_status="{ item }">
 *   <StatusBadge :status="item.status" />
 * </template>
 * 
 * Customize status mapping in statusStyle function for your entity statuses.
 */

export interface Props {
  status: string | undefined;
}

defineProps<Props>();

const statusStyle = (status: string | undefined) => {
  const result: {
    outline: boolean;
    variant: "info" | "warning" | "danger" | "success" | "light-danger" | "info-dark" | "primary";
  } = {
    outline: true,
    variant: "info",
  };

  // Customize these status mappings for your entity
  switch (status) {
    case "Active":
    case "Published":
    case "Completed":
      result.outline = false;
      result.variant = "success";
      break;
    case "New":
    case "Draft":
      result.outline = true;
      result.variant = "warning";
      break;
    case "Pending":
    case "InProgress":
      result.outline = false;
      result.variant = "warning";
      break;
    case "Confirmed":
    case "Approved":
      result.outline = true;
      result.variant = "success";
      break;
    case "Cancelled":
    case "Rejected":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Inactive":
    case "Disabled":
      result.outline = true;
      result.variant = "info";
      break;
    default:
      result.outline = true;
      result.variant = "info";
  }
  return result;
};
</script>

