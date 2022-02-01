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
        <vc-slider
          :navigation="!expanded && importProfiles && importProfiles.length > 1"
          :overflow="true"
          :slides="importProfiles"
        >
          <template v-slot="{ slide }">
            <vc-button
              class="import__widget"
              @click="openImporter(slide.id)"
              icon="fas fa-file-csv"
              variant="widget"
            >
              {{ slide.name }}</vc-button
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
            :loading="loading"
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
import { computed, defineComponent, onMounted, ref } from "vue";
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";
import useImport from "../composables/useImport";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportNew from "./import-new.vue";
import {
  ImportProfile,
  ImportPushNotification,
  ImportRunHistory,
} from "../../../api_client";

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
      importStatus,
      importProfiles,
      loading,
      fetchImportHistory,
      fetchImportProfiles,
    } = useImport();
    const bladeWidth = ref(50);

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
      bladeWidth.value = 30;
      emit("page:open", {
        component: ImportNew,
        param: profileId,
      });
    }

    function onItemClick(item: ImportRunHistory) {
      bladeWidth.value = 30;
      emit("page:open", {
        component: ImportNew,
        param: item.profileId,
        componentOptions: {
          importJobId: item.jobId,
        },
      });
    }

    return {
      title: computed(() => t("IMPORT.PAGES.PROFILE_SELECTOR.TITLE")),
      bladeToolbar,
      columns,
      importHistory,
      bladeWidth,
      importProfiles,
      importStarted: computed(
        () => importStatus.value && importStatus.value.jobId
      ),
      openImporter,
      onItemClick,
      reload,
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
}
</style>
