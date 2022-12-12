<template>
  <VcBlade
    v-loading="loading"
    :title="$t('IMPORT.PAGES.PROFILE_SELECTOR.TITLE')"
    :width="bladeWidth + '%'"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
  >
    <VcContainer class="import">
      <!-- Import profile widgets-->
      <div class="p-3" v-if="importProfiles && importProfiles.length">
        <VcSlider :navigation="true" :overflow="true" :slides="importProfiles">
          <template v-slot="{ slide }">
            <div class="relative">
              <VcStatus
                variant="success"
                :outline="false"
                class="absolute right-0 -top-[10px]"
                v-if="slide.inProgress"
                >{{ $t("IMPORT.PAGES.WIDGETS.IN_PROGRESS") }}</VcStatus
              >
              <VcButton
                class="w-max"
                @click="openImporter(slide.id)"
                icon="fas fa-file-csv"
                variant="widget"
                :selected="selectedProfileId === slide.id"
              >
                {{ slide.name }}
                <VcHint>{{ slide.dataImporterType }}</VcHint>
              </VcButton>
            </div>
          </template>
        </VcSlider>
      </div>
      <VcCard
        :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')"
        class="import__archive m-3"
      >
        <VcTable
          :loading="loading"
          :columns="columns"
          :items="importHistory"
          :header="false"
          @itemClick="onItemClick"
          :selectedItemId="selectedItemId"
          :totalCount="totalHistoryCount"
          :pages="historyPages"
          :currentPage="currentPage"
          @paginationClick="onPaginationClick"
        >
          <!-- Override name column template -->
          <template v-slot:item_name="itemData">
            <div class="flex flex-col">
              <div class="truncate">
                {{ itemData.item.name }}
              </div>
            </div>
          </template>

          <!-- Override finished column template -->
          <template v-slot:item_finished="itemData">
            <ImportStatus :item="itemData.item" />
          </template>
        </VcTable>
      </VcCard>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, shallowRef } from "vue";

export default defineComponent({
  url: "/import",
});
</script>

<script lang="ts" setup>
import {IBladeEvent, IBladeToolbar, useI18n, ITableColumns, VcBlade, VcContainer, VcSlider, VcStatus, VcButton, VcCard, VcTable} from "@vc-shell/framework";
import useImport from "../composables/useImport";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportNew from "./import-new.vue";
import { ImportRunHistory } from "../../../api_client/marketplacevendor";
import ImportStatus from "../components/ImportStatus.vue";

type IBladeOptions = IBladeEvent & {
    bladeOptions?: {
        importJobId?: string,
        title?: string
    }
}

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    importJobId?: string;
  };
}

export interface Emits {
    (event: 'open:blade', blade: IBladeOptions): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
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
    title: computed(() =>
      t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.ADD_PROFILE")
    ),
    icon: "fas fa-plus",
    clickHandler() {
      newProfile();
    },
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

onMounted(async () => {
  await reload();
  if (props.param) {
    selectedProfileId.value = props.param;
  }
  if (props.options && props.options.importJobId) {
    const historyItem = importHistory.value.find(
      (x) => x.jobId === props.options.importJobId
    );
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

  emit("open:blade", {
    component: shallowRef(ImportProfileDetails),
  });
}

function openImporter(profileId: string) {
  bladeWidth.value = 50;

  const profile = importProfiles.value.find(
    (profile) => profile.id === profileId
  );

  emit("open:blade", {
    component: shallowRef(ImportNew),
    param: profileId,
    bladeOptions: {
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

  emit("open:blade", {
    component: shallowRef(ImportNew),
    param: item.profileId,
    bladeOptions: {
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
    @apply flex flex-col;
  }

  &__archive {
    & .vc-card__body {
      @apply flex flex-col;
    }
  }
}
</style>
