<template>
  <vc-blade
    :title="$t('IMPORT.PAGES.PROFILE_SELECTOR.TITLE')"
    :width="bladeWidth + '%'"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
  >
    <vc-container>
      <!-- Import profile widgets-->
      <div class="vc-padding_m">
        <vc-slider
          :navigation="!expanded && importersList && importersList.length > 1"
          :overflow="true"
          :slides="importersList"
        >
          <template v-slot="{ slide }">
            <vc-button
              class="import__widget"
              @click="openImporter(slide)"
              icon="fas fa-file-csv"
              variant="widget"
            >
              {{ slide.typeName }}</vc-button
            >
          </template>
        </vc-slider>
      </div>
      <vc-col class="vc-padding_m">
        <vc-card
          :fill="true"
          :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')"
          class="vc-flex import__archive"
        >
          <vc-table
            :columns="columns"
            :items="importHistory"
            :header="false"
            @itemClick="onItemClick"
          >
            <!-- Override name column template -->
            <template v-slot:item_name="itemData">
              <div class="vc-flex vc-flex-column">
                <div class="vc-ellipsis">{{ itemData.item.name }}</div>
              </div>
            </template>
          </vc-table>
        </vc-card>
      </vc-col>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";
import useImport from "../composables/useImport";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportNew from "./import-new.vue";
import { IDataImporter, ImportPushNotification } from "../../../api_client";

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
    const { importHistory, importStatus, selectImporter, fetchDataImporters } =
      useImport();
    const importersList = ref<IDataImporter[]>([]);
    const bladeWidth = ref(50);

    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "refresh",
        title: t("IMPORT.PAGES.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
      },
      {
        id: "new",
        title: t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.ADD_PROFILE"),
        icon: "fas fa-plus",
        clickHandler() {
          profileClick();
        },
      },
    ]);
    const columns = ref<ITableColumns[]>([
      {
        id: "jobId", // temp
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
      },
      {
        id: "created",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.STARTED_AT"),
        width: 147,
        type: "date",
        format: "L LT",
      },
      {
        id: "errorCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT"),
        width: 118,
        sortable: true,
      },
    ]);

    onMounted(async () => {
      importersList.value = await fetchDataImporters();
    });

    function profileClick() {
      bladeWidth.value = 70;
      emit("page:open", {
        component: ImportProfileDetails,
      });
    }

    function openImporter(importer: IDataImporter) {
      bladeWidth.value = 30;
      selectImporter(importer);
      emit("page:open", {
        component: ImportNew,
      });
    }

    function onItemClick(item: ImportPushNotification) {
      bladeWidth.value = 30;
      emit("page:open", {
        component: ImportNew,
        param: item.jobId,
      });
    }

    return {
      bladeToolbar,
      columns,
      importHistory,
      importersList,
      bladeWidth,
      title: t("IMPORT.PAGES.PROFILE_SELECTOR.TITLE"),
      importStarted: computed(
        () => importStatus.value && importStatus.value.jobId
      ),
      openImporter,
      onItemClick,
    };
  },
});
</script>

<style lang="less" scoped>
.import {
  &__widget {
    width: max-content;
  }
}
</style>
