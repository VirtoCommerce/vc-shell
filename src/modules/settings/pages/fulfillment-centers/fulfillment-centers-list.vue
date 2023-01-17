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
      :items="fulfillmentCentersList"
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
    >
      <template v-slot:mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>{{
                $t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME")
              }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  shallowRef,
} from "vue";
import { UserPermissions } from "../../../../types";

export default defineComponent({
  url: "/fulfillment-centers-list",
  permissions: [UserPermissions.SellerDetailsEdit],
});
</script>

<script lang="ts" setup>
import {
  IBladeEvent,
  IBladeToolbar,
  ITableColumns,
  useI18n,
} from "@vc-shell/framework";
import useFulfillmentCenters from "../../composables/useFulfillmentCenters";
import FulfillmentCenterDetails from "./fulfillment-center-details.vue";
import { FulfillmentCenter } from "../../../../api_client/marketplacevendor";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "open:blade", blade: IBladeEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const {
  searchQuery,
  loading,
  currentPage,
  pages,
  totalCount,
  fulfillmentCentersList,
  searchFulfillmentCenters,
} = useFulfillmentCenters();

const sort = ref("createdDate:DESC");
const selectedItemId = ref();
const title = t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TITLE");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() =>
      t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.REFRESH")
    ),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addMember",
    title: computed(() =>
      t(
        "SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.ADD_FULFILLMENT_CENTER"
      )
    ),
    icon: "fas fa-plus",
    clickHandler() {
      emit("open:blade", {
        component: shallowRef(FulfillmentCenterDetails),
      });
    },
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: computed(() =>
      t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME")
    ),
    sortable: true,
  },
]);

watch(sort, async (value) => {
  await searchFulfillmentCenters({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  await reload();
});

const reload = async () => {
  await searchFulfillmentCenters({
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
  await searchFulfillmentCenters({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const onItemClick = (item: FulfillmentCenter) => {
  emit("open:blade", {
    component: shallowRef(FulfillmentCenterDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

defineExpose({
  reload,
  title,
});
</script>
