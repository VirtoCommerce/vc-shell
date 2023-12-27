<template>
  <VcBlade
    :title="$t('IMPORT.PAGES.PROFILE_SELECTOR.TITLE')"
    :width="bladeWidth + '%'"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="import">
      <!-- Import profile widgets-->
      <div
        v-if="importProfiles && importProfiles.length"
        class="tw-p-3"
      >
        <VcSlider
          :navigation="true"
          :overflow="true"
          :slides="importProfiles"
          :loading="loading"
        >
          <template #default="{ slide }">
            <div class="tw-relative">
              <VcStatus
                v-if="slide.inProgress"
                variant="success"
                :outline="false"
                class="tw-absolute tw-right-0 -tw-top-[10px]"
                >{{ $t("IMPORT.PAGES.WIDGETS.IN_PROGRESS") }}</VcStatus
              >
              <VcButton
                class="tw-w-max tw-text-black !tw-p-[15px]"
                icon="fas fa-file-csv"
                icon-class="!tw-text-[30px] tw-text-[color:#a9bfd2]"
                text
                raised
                :selected="selectedProfileId === slide.id"
                @click="openImporter(slide.id)"
              >
                <span class="tw-text-black">{{ slide.name }}</span>
                <VcHint>{{ slide.dataImporterType }}</VcHint>
              </VcButton>
            </div>
          </template>
        </VcSlider>
      </div>
      <div
        v-else
        v-loading="loading"
        class="tw-my-4"
      ></div>
      <VcCard
        :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')"
        class="import__archive tw-m-3"
      >
        <VcTable
          :loading="loading"
          :columns="columns"
          :items="importHistory"
          :header="false"
          :selected-item-id="selectedItemId"
          :total-count="totalHistoryCount"
          :pages="historyPages"
          :current-page="currentPage"
          state-key="import_profile_history"
          @item-click="onItemClick"
          @pagination-click="onPaginationClick"
        >
          <!-- Override name column template -->
          <template #item_profileName="itemData">
            <div class="tw-flex tw-flex-col">
              <div class="tw-truncate">
                {{ itemData.item.profileName }}
              </div>
            </div>
          </template>

          <!-- Override finished column template -->
          <template #item_finished="itemData">
            <ImportStatus :item="itemData.item" />
          </template>
        </VcTable>
      </VcCard>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  IBladeToolbar,
  ITableColumns,
  VcBlade,
  VcContainer,
  VcSlider,
  VcStatus,
  VcButton,
  VcCard,
  VcTable,
  usePermissions,
  useBladeNavigation,
} from "@vc-shell/framework";
import useImport from "../composables/useImport";
import { ImportRunHistory } from "@vcmp-vendor-portal/api/marketplacevendor";
import ImportStatus from "../components/ImportStatus.vue";
import { UserPermissions } from "../../types";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    importJobId: string;
  };
}

export interface Emits {
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  url: "/import",
  name: "ImportProfileSelector",
  isWorkspace: true,
  menuItem: {
    title: "IMPORT.MENU.TITLE",
    icon: "fas fa-file-import",
    priority: 4,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const { t } = useI18n({ useScope: "global" });
const { hasAccess } = usePermissions();

const {
  importHistory,
  historyPages,
  totalHistoryCount,
  importProfiles,
  loading,
  currentPage,
  fetchImportHistory,
  fetchImportProfiles,
} = useImport();
const bladeWidth = ref(50);
const selectedProfileId = ref();
const selectedItemId = ref();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "new",
    title: computed(() => t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.ADD_PROFILE")),
    icon: "fas fa-plus",
    clickHandler() {
      newProfile();
    },
    isVisible: computed(() => hasAccess(UserPermissions.SellerImportProfilesEdit)),
  },
]);
const columns = ref<ITableColumns[]>([
  {
    id: "profileName", // temp
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.PROFILE_NAME")),
    alwaysVisible: true,
    width: 147,
  },
  {
    id: "createdBy",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.CREATED_BY")),
    width: 147,
  },
  {
    id: "finished",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 147,
  },
  {
    id: "createdDate",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.STARTED_AT")),
    width: 147,
    type: "date",
    format: "L LT",
  },
  {
    id: "errorsCount",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT")),
    width: 118,
    sortable: true,
  },
]);

const title = computed(() => t("IMPORT.PAGES.PROFILE_SELECTOR.TITLE"));

watch(
  () => [props.param] as const,
  async ([newParam]) => {
    if (newParam && props.options && props.options.importJobId) {
      await openBlade({
        blade: resolveBladeByName("ImportNew"),
        param: props.param,
        options: {
          importJobId: props.options.importJobId,
        },
        onOpen() {
          selectedItemId.value = newParam;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await reload();
  if (props.param && !props.options) {
    selectedProfileId.value = props.param;
  }
  if (props.options && props.options.importJobId) {
    const historyItem = importHistory.value.find((x) => x.jobId === props.options.importJobId);
    if (historyItem) {
      selectedItemId.value = historyItem.id;
    }
  }
});

async function reload() {
  await fetchImportHistory();
  await fetchImportProfiles();
}

function newProfile() {
  bladeWidth.value = 70;

  openBlade({
    blade: resolveBladeByName("ImportProfileDetails"),
  });
}

function openImporter(profileId: string) {
  bladeWidth.value = 50;

  const profile = importProfiles.value.find((profile) => profile.id === profileId);

  openBlade({
    blade: resolveBladeByName("ImportNew"),
    param: profileId,
    options: {
      importJobId: profile && profile.inProgress ? profile.jobId : undefined,
    },
    onOpen() {
      selectedProfileId.value = profileId;
    },
    onClose() {
      selectedProfileId.value = undefined;
    },
  });
}

function onItemClick(item: ImportRunHistory) {
  bladeWidth.value = 50;

  openBlade({
    blade: resolveBladeByName("ImportNew"),
    param: item.profileId,
    options: {
      importJobId: item.jobId,
      title: item.profileName,
    },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

async function onPaginationClick(page: number) {
  await fetchImportHistory({
    skip: (page - 1) * 15,
  });
}

defineExpose({
  openImporter,
  reload,
  title,
});
</script>

<style lang="scss">
.import {
  & .vc-container__inner {
    @apply tw-flex tw-flex-col;
  }

  &__archive {
    & .vc-card__body {
      @apply tw-flex tw-flex-col;
    }
  }
}
</style>
