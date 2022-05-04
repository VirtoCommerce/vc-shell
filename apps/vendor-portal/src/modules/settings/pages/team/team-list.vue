<template>
  <VcBlade
    :title="$t('SETTINGS.TEAM.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <VcTable
      class="vc-flex-grow_1"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="membersList"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :totalCount="totalCount"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      :header="false"
    >
      <!-- Override status column template -->
      <template v-slot:item_isLockedOut="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">
            {{
              itemData.item.isLockedOut
                ? $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.INACTIVE")
                : $t("SETTINGS.TEAM.PAGES.LIST.TABLE.STATUS.ACTIVE")
            }}
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue";

export default defineComponent({
  url: "team",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar, ITableColumns } from "../../../../types";
import { useI18n } from "@virtoshell/core";
import useTeamMembers from "../../composables/useTeamMembers";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["page:close"]);

const { t } = useI18n();
const {
  getTeamMembers,
  searchQuery,
  loading,
  membersList,
  currentPage,
  pages,
  totalCount,
} = useTeamMembers();

const sort = ref("createdDate:DESC");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "addMember",
    title: computed(() => t("SETTINGS.TEAM.PAGES.LIST.TOOLBAR.ADD_MEMBER")),
    icon: "fas fa-plus",
  },
]);

watch(sort, async (value) => {
  await getTeamMembers({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
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
    sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
  }
};

const onPaginationClick = async (page: number) => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const columns = ref<ITableColumns[]>([
  {
    id: "firstName",
    title: computed(() =>
      t("SETTINGS.TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME")
    ),
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
</script>
