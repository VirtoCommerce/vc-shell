<template>
  {{ roleName(context.item.role) }}
</template>
<script setup lang="ts">
import { SellerUser } from "@vcmp-vendor-portal/api/marketplacevendor";
import { roles } from "../common";

export interface Props {
  context: {
    item: SellerUser;
  };
}

const roleName = (roleId: string | undefined) => {
  if (!roleId) return "N/A";
  return roles.value.find((role) => role.id === roleId)?.name || "N/A";
};

defineProps<Props>();
</script>
