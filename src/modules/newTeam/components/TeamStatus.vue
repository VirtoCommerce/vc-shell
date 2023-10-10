<template>
  <div class="tw-flex">
    <VcStatus
      :variant="context.item.isLockedOut ? 'danger' : 'success'"
      :outline="false"
      >{{
        context.item.isLockedOut
          ? $t("TEAM.PAGES.LIST.TABLE.STATUS.INACTIVE")
          : $t("TEAM.PAGES.LIST.TABLE.STATUS.ACTIVE")
      }}</VcStatus
    >
  </div>
</template>
<script setup lang="ts">
import { SellerUser } from "./../../../api_client/marketplacevendor";

export interface Props {
  context: {
    item: SellerUser;
  };
}

defineProps<Props>();
</script>
