<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    v-loading="loading"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :items="items"
      :columns="columns"
      :loading="loading"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      :multiselect="true"
      :selected-item-id="selectedItemId"
      :sort="sort"
      state-key="offers-list-state"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @selection-changed="onSelectionChanged"
    >
      <template #mobile-item="{ item }">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-cursor-pointer">
          <div class="tw-flex tw-gap-2 tw-items-start">
            <VcImage
              v-if="item.image"
              :src="item.image"
              size="s"
            />
            <div class="tw-flex-1">
              <div class="tw-font-bold tw-text-base">{{ item.name }}</div>
              <div class="tw-text-sm tw-text-[#a1a7b3] tw-mt-1">SKU: {{ item.sku }}</div>
              <div class="tw-flex tw-gap-2 tw-mt-2">
                <VcStatus
                  :variant="item.isActive ? 'success' : 'danger'"
                  :outline="false"
                >
                  {{ item.isActive ? $t("OFFERS.PAGES.LIST.STATUS.ENABLED") : $t("OFFERS.PAGES.LIST.STATUS.DISABLED") }}
                </VcStatus>
                <VcStatus
                  v-if="item.isDefault"
                  variant="info"
                  :outline="false"
                >
                  {{ $t("OFFERS.PAGES.LIST.STATUS.DEFAULT") }}
                </VcStatus>
              </div>
            </div>
            <VcIcon
              icon="fas fa-trash"
              size="xs"
              class="tw-text-[#a1a7b3] tw-cursor-pointer"
              @click.stop="onDeleteClick(item)"
            />
          </div>
        </div>
      </template>

      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-4">
            <VcCol>
              <VcInput
                v-model="searchKeyword"
                :placeholder="$t('OFFERS.PAGES.LIST.FILTER.SEARCH_PLACEHOLDER')"
                clearable
                @update:model-value="onSearchChange"
              />
            </VcCol>
            <VcCol>
              <VcSelect
                v-model="sortField"
                :label="$t('OFFERS.PAGES.LIST.FILTER.SORT_BY')"
                :options="sortOptions"
                @update:model-value="onSortChange"
              />
            </VcCol>
          </VcRow>
        </div>
      </template>

      <template #item_image="{ item }">
        <VcImage
          v-if="item.image"
          :src="item.image"
          size="s"
        />
        <div
          v-else
          class="tw-w-10 tw-h-10 tw-bg-[#f3f4f6] tw-rounded"
        ></div>
      </template>

      <template #item_name="{ item }">
        <div class="tw-text-[#319eda] tw-cursor-pointer hover:tw-underline">{{ item.name }}</div>
      </template>

      <template #item_createdDate="{ item }">
        <VcHint>{{ formatDateAgo(item.createdDate) }}</VcHint>
      </template>

      <template #item_isActive="{ item }">
        <VcStatus
          :variant="item.isActive ? 'success' : 'danger'"
          :outline="false"
        >
          {{ item.isActive ? $t("OFFERS.PAGES.LIST.STATUS.ENABLED") : $t("OFFERS.PAGES.LIST.STATUS.DISABLED") }}
        </VcStatus>
      </template>

      <template #item_isDefault="{ item }">
        <VcStatus
          v-if="item.isDefault"
          variant="info"
          :outline="false"
        >
          {{ $t("OFFERS.PAGES.LIST.STATUS.DEFAULT") }}
        </VcStatus>
        <span
          v-else
          class="tw-text-[#a1a7b3]"
          >-</span
        >
      </template>

      <template #item_actions="{ item }">
        <VcIcon
          icon="fas fa-trash"
          size="xs"
          class="tw-text-[#a1a7b3] tw-cursor-pointer hover:tw-text-[#f14e4e]"
          @click.stop="onDeleteClick(item)"
        />
      </template>

      <template #notfound>
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8">
          <VcIcon
            icon="fas fa-search"
            size="xxl"
            class="tw-text-[#a1a7b3] tw-mb-4"
          />
          <div class="tw-text-xl tw-font-bold tw-mb-2">{{ $t("OFFERS.PAGES.LIST.NOT_FOUND.TITLE") }}</div>
          <div class="tw-text-[#a1a7b3] tw-mb-4">{{ $t("OFFERS.PAGES.LIST.NOT_FOUND.MESSAGE") }}</div>
          <VcButton @click="onResetSearch">{{ $t("OFFERS.PAGES.LIST.NOT_FOUND.ACTION") }}</VcButton>
        </div>
      </template>

      <template #empty>
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8">
          <VcIcon
            icon="fas fa-inbox"
            size="xxl"
            class="tw-text-[#a1a7b3] tw-mb-4"
          />
          <div class="tw-text-xl tw-font-bold tw-mb-2">{{ $t("OFFERS.PAGES.LIST.EMPTY.TITLE") }}</div>
          <div class="tw-text-[#a1a7b3] tw-mb-4">{{ $t("OFFERS.PAGES.LIST.EMPTY.MESSAGE") }}</div>
          <VcButton @click="onAddOffer">{{ $t("OFFERS.PAGES.LIST.EMPTY.ACTION") }}</VcButton>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { IParentCallArgs, IBladeToolbar, useBladeNavigation, useNotifications } from "@vc-shell/framework";
import { ref, computed, onMounted, markRaw } from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";
import useOfferList from "../composables/useOfferList";
import OffersDetails from "./offers-details.vue";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,
  menuItem: {
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tag",
    priority: 1,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const notifications = useNotifications();
const { openBlade } = useBladeNavigation();

const { items, loading, totalCount, currentPage, pages, loadOffers, deleteOffer, bulkDeleteOffers } = useOfferList();

const selectedItemId = ref<string>();
const selectedIds = ref<string[]>([]);
const searchKeyword = ref("");
const sortField = ref("createdDate");
const sort = ref("");

const title = computed(() => t("OFFERS.PAGES.LIST.TITLE"));

const columns = computed(() => [
  {
    id: "image",
    title: t("OFFERS.PAGES.LIST.COLUMNS.IMAGE"),
    width: 60,
  },
  {
    id: "name",
    title: t("OFFERS.PAGES.LIST.COLUMNS.NAME"),
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("OFFERS.PAGES.LIST.COLUMNS.CREATED_DATE"),
    sortable: true,
  },
  {
    id: "sku",
    title: t("OFFERS.PAGES.LIST.COLUMNS.SKU"),
    sortable: true,
  },
  {
    id: "isActive",
    title: t("OFFERS.PAGES.LIST.COLUMNS.ENABLED"),
    sortable: true,
  },
  {
    id: "isDefault",
    title: t("OFFERS.PAGES.LIST.COLUMNS.DEFAULT"),
    sortable: true,
  },
  {
    id: "actions",
    title: t("OFFERS.PAGES.LIST.COLUMNS.ACTIONS"),
    width: 50,
  },
]);

const sortOptions = computed(() => [
  { value: "name", label: t("OFFERS.PAGES.LIST.SORT.NAME") },
  { value: "createdDate", label: t("OFFERS.PAGES.LIST.SORT.CREATED_DATE") },
  { value: "sku", label: t("OFFERS.PAGES.LIST.SORT.SKU") },
  { value: "isActive", label: t("OFFERS.PAGES.LIST.SORT.ENABLED") },
  { value: "isDefault", label: t("OFFERS.PAGES.LIST.SORT.DEFAULT") },
]);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
      notifications.success({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.REFRESHED") });
    },
  },
  {
    id: "add",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      await onAddOffer();
    },
  },
  {
    id: "delete",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    disabled: computed(() => selectedIds.value.length === 0),
    isVisible: computed(() => window.innerWidth >= 1024), // Desktop only
    async clickHandler() {
      await onBulkDelete();
    },
  },
]);

async function reload() {
  await loadOffers({
    skip: (currentPage.value - 1) * 20,
    take: 20,
    keyword: searchKeyword.value,
    sort: sort.value,
  });
}

async function onItemClick(item: any) {
  await openBlade({
    blade: markRaw(OffersDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
      reload(); // Reload list after closing details
    },
  });
}

async function onAddOffer() {
  await openBlade({
    blade: markRaw(OffersDetails),
    onClose() {
      reload(); // Reload list after creating new offer
    },
  });
}

async function onDeleteClick(item: any) {
  if (confirm(t("OFFERS.PAGES.LIST.CONFIRM.DELETE_SINGLE"))) {
    try {
      await deleteOffer(item.id);
      notifications.success({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.DELETED") });
      await reload();
    } catch (error) {
      notifications.error({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.DELETE_FAILED") });
    }
  }
}

async function onBulkDelete() {
  if (selectedIds.value.length === 0) return;

  if (confirm(t("OFFERS.PAGES.LIST.CONFIRM.DELETE_MULTIPLE", { count: selectedIds.value.length }))) {
    try {
      await bulkDeleteOffers(selectedIds.value);
      notifications.success({
        text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.BULK_DELETED", { count: selectedIds.value.length }),
      });
      selectedIds.value = [];
      await reload();
    } catch (error) {
      notifications.error({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.BULK_DELETE_FAILED") });
    }
  }
}

function onHeaderClick(column: { id: string }) {
  if (sort.value === column.id) {
    sort.value = `${column.id}:desc`;
  } else if (sort.value === `${column.id}:desc`) {
    sort.value = "";
  } else {
    sort.value = column.id;
  }
  reload();
}

async function onPaginationClick(page: number) {
  await loadOffers({
    skip: (page - 1) * 20,
    take: 20,
    keyword: searchKeyword.value,
    sort: sort.value,
  });
}

function onSelectionChanged(ids: string[]) {
  selectedIds.value = ids;
}

async function onSearchChange(keyword: string) {
  searchKeyword.value = keyword;
  await loadOffers({
    skip: 0,
    take: 20,
    keyword: searchKeyword.value,
    sort: sort.value,
  });
}

async function onSortChange(value: string) {
  sortField.value = value;
  sort.value = value;
  await reload();
}

function onResetSearch() {
  searchKeyword.value = "";
  sort.value = "";
  sortField.value = "createdDate";
  reload();
}

function formatDateAgo(date: string | Date) {
  return moment(date).fromNow();
}

onMounted(async () => {
  await reload();

  // Listen for domain events
  window.addEventListener("OfferCreatedDomainEvent", () => {
    reload();
    notifications.success({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.CREATED") });
  });

  window.addEventListener("OfferDeletedDomainEvent", () => {
    reload();
    notifications.success({ text: t("OFFERS.PAGES.LIST.NOTIFICATIONS.DELETED") });
  });
});

defineExpose({
  title,
  reload,
});
</script>
