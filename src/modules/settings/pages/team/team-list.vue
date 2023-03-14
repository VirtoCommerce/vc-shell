<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="membersList"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :totalCount="totalCount"
      @headerClick="onHeaderClick"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      :header="false"
      :selectedItemId="selectedItemId"
      state-key="team_list"
    >
      <!-- Override status column template -->
      <template v-slot:item_isLockedOut="itemData">
        <div class="tw-flex">
          <VcStatus
            :variant="itemData.item.isLockedOut ? 'danger' : 'success'"
            :outline="false"
            >{{
              itemData.item.isLockedOut
                ? $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.INACTIVE")
                : $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.ACTIVE")
            }}</VcStatus
          >
        </div>
      </template>

      <!-- Override role column template -->
      <template v-slot:item_role="itemData">
        {{ roleName(itemData.item.role as string) }}
      </template>

      <template v-slot:mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.firstName }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0">
              <VcHint>{{ $t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.LAST_NAME") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.lastName }}
              </div>
            </div>
          </div>
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.EMAIL") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.email || "N/A" }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.ROLE") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ roleName(itemData.item.role as string) }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0">
              <VcHint>{{ $t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.STATUS") }}</VcHint>
              <div class="tw-mt-1">
                <VcStatus
                  :variant="itemData.item.isLockedOut ? 'danger' : 'success'"
                  :outline="false"
                  >{{
                    itemData.item.isLockedOut
                      ? $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.INACTIVE")
                      : $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.ACTIVE")
                  }}</VcStatus
                >
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, shallowRef } from "vue";
import { UserPermissions } from "../../../../types";

export default defineComponent({
  url: "/team",
  permissions: [UserPermissions.SellerUsersManage],
});
</script>

<script lang="ts" setup>
import { IBladeEvent, IBladeToolbar, ITableColumns, useI18n } from "@vc-shell/framework";
import useTeamMembers from "../../composables/useTeamMembers";
import TeamMemberDetails from "./team-member-details.vue";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export type IBladeOptions = IBladeEvent & {
  bladeOptions?: {
    user?: { id?: string };
  };
};

export interface Emits {
  (event: "close:blade"): void;
  (event: "open:blade", blade: IBladeOptions): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
  options: () => ({}),
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const { getTeamMembers, searchQuery, loading, membersList, currentPage, pages, totalCount } = useTeamMembers();

const sort = ref("createdDate:DESC");
const selectedItemId = ref();
const title = t("SETTINGS.TEAM.PAGES.LIST.TITLE");

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

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addMember",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TOOLBAR.ADD_MEMBER")),
    icon: "fas fa-plus",
    clickHandler() {
      emit("open:blade", {
        component: shallowRef(TeamMemberDetails),
      });
    },
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "firstName",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "lastName",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.LAST_NAME")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "email",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.EMAIL")),
    alwaysVisible: true,
  },
  {
    id: "role",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.ROLE")),
    alwaysVisible: true,
  },
  {
    id: "isLockedOut",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.STATUS")),
    alwaysVisible: true,
  },
]);

watch(sort, async (value) => {
  await getTeamMembers({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  await reload();
});

const reload = async () => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
};

const onHeaderClick = (item: ITableColumns) => {
  const sortBy = [":DESC", ":ASC", ""];
  if (item.sortable) {
    item.sortDirection = (item.sortDirection ?? 0) + 1;
    if (sortBy[item.sortDirection % 3] === "") {
      sort.value = `${sortBy[item.sortDirection % 3]}`;
    } else {
      sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
    }
  }
};

const onPaginationClick = async (page: number) => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const onItemClick = (item: { id?: string }) => {
  emit("open:blade", {
    component: shallowRef(TeamMemberDetails),
    param: item.id,
    bladeOptions: {
      user: item,
    },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const roleName = (roleId: string) => {
  return roles.find((role) => role.id === roleId)?.name || "N/A";
};

defineExpose({
  reload,
  title,
});
</script>
