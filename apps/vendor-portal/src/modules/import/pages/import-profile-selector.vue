<template>
  <vc-blade
    v-loading="loading"
    :title="$t('IMPORT.PAGES.PROFILE_SELECTOR.TITLE')"
    :width="bladeWidth + '%'"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
  >
    <vc-container class="import">
      <!-- Import profile widgets-->
      <div class="vc-padding_m">
        <vc-slider :navigation="true" :overflow="true" :slides="importProfiles">
          <template v-slot="{ slide }">
            <div class="import__widget-wrapper">
              <vc-status
                variant="success"
                :outline="false"
                class="import__widget-progress"
                v-if="slide.inProgress"
                >{{ $t("IMPORT.PAGES.WIDGETS.IN_PROGRESS") }}</vc-status
              >
              <vc-button
                class="import__widget"
                @click="openImporter(slide.id)"
                icon="fas fa-file-csv"
                variant="widget"
                :selected="selectedProfileId === slide.id"
              >
                {{ slide.name }}
                <vc-hint>{{ slide.dataImporterType }}</vc-hint>
              </vc-button>
            </div>
          </template>
        </vc-slider>
      </div>
      <!--      <vc-col class="vc-padding_m">-->
      <vc-card
        :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')"
        class="import__archive vc-margin_m"
      >
        <vc-table
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
            <div class="vc-flex vc-flex-column">
              <div class="vc-ellipsis">{{ itemData.item.name }}</div>
            </div>
          </template>
        </vc-table>
      </vc-card>
      <!--      </vc-col>-->
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";
import useImport from "../composables/useImport";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportNew from "./import-new.vue";
import { ImportRunHistory } from "../../../api_client";

export default defineComponent({
  url: "import",
  props: {
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
  },
  emits: ["page:open"],
  setup(props, { emit }) {
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
        title: computed(() =>
          t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.REFRESH")
        ),
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
      },
      {
        id: "createdBy",
        title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.CREATED_BY")),
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
      emit("page:open", {
        component: ImportProfileDetails,
      });
    }

    function openImporter(profileId: string) {
      bladeWidth.value = 50;

      const profile = importProfiles.value.find(
        (profile) => profile.id === profileId
      );

      emit("page:open", {
        component: ImportNew,
        param: profileId,
        componentOptions: {
          importJobId:
            profile && profile.inProgress ? profile.jobId : undefined,
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
      selectedProfileId.value = item.profileId;
      emit("page:open", {
        component: ImportNew,
        param: item.profileId,
        componentOptions: {
          importJobId: item.jobId,
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

    return {
      title: computed(() => t("IMPORT.PAGES.PROFILE_SELECTOR.TITLE")),
      bladeToolbar,
      columns,
      importHistory,
      bladeWidth,
      importProfiles,
      selectedProfileId,
      selectedItemId,
      historyPages,
      totalHistoryCount,
      currentPage,
      openImporter,
      onItemClick,
      reload,
      onPaginationClick,
      loading,
    };
  },
});
</script>

<style lang="less">
.import {
  & .vc-container__inner {
    display: flex;
    flex-direction: column;
  }

  &__widget {
    width: max-content;
  }

  &__widget-wrapper {
    position: relative;
  }

  &__widget-progress {
    position: absolute;
    right: 0;
    top: -10px;
  }

  &__archive {
    & .vc-card__body {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
