<template>
  <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.firstName }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("TEAM.PAGES.LIST.TABLE.HEADER.LAST_NAME") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.lastName }}
        </div>
      </div>
    </div>
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("TEAM.PAGES.LIST.TABLE.HEADER.EMAIL") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.email || "N/A" }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("TEAM.PAGES.LIST.TABLE.HEADER.ROLE") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ roleName(context.item.role as string) }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("TEAM.PAGES.LIST.TABLE.HEADER.STATUS") }}</VcHint>
        <div class="tw-mt-1">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SellerUser } from "../../../api_client/marketplacevendor";

export interface Props {
  context: {
    item: SellerUser;
  };
}

defineProps<Props>();

const roles = [
  {
    id: "vcmp-admin-role",
    name: "Admin",
  },
  {
    id: "vcmp-agent-role",
    name: "Agent",
  },
  {
    id: "vcmp-owner-role",
    name: "Owner",
  },
];

const roleName = (roleId: string) => {
  return roles.find((role) => role.id === roleId)?.name || "N/A";
};
</script>
