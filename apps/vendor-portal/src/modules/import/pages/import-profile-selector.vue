<template>
  <vc-blade
    :title="$t('IMPORT.PAGES.PROFILE_SELECTOR.TITLE')"
    width="30%"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
  >
    <vc-container>
      <vc-row>
        <vc-col class="vc-padding_l">
          <vc-button>Offers XLS</vc-button>
        </vc-col>
        <vc-col class="vc-padding_l">
          <vc-button>Product CSV</vc-button>
        </vc-col>
        <vc-col class="vc-padding_l">
          <vc-button>Products SAP via API</vc-button>
        </vc-col>
      </vc-row>
      <vc-col class="vc-padding_l">
        <vc-card header="Last executions" class="vc-flex import__archive">
          <vc-table :columns="columns" :items="importHistory" :header="false">
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
import { defineComponent, reactive, ref } from "vue";
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";
import useImport from "../composables/useImport";
import ImportProfileDetails from "./import-profile-details.vue";

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
  setup(props, { emit }) {
    const { t } = useI18n();
    const { importHistory } = useImport();
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "new",
        title: t("IMPORT.PAGES.PROFILE_SELECTOR.TOOLBAR.ADD_PROFILE"),
        icon: "fas fa-plus",
        clickHandler() {
          profileClick();
        },
      },
      {
        id: "refresh",
        title: t("IMPORT.PAGES.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
      },
    ]);
    const columns = ref<ITableColumns[]>([
      {
        id: "jobId", // temp
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
      },
      {
        id: "processedCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.PROCESSED_COUNT"),
        width: 147,
      },
      {
        id: "errorCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT"),
        width: 118,
        sortable: true,
      },
      {
        id: "finished",
        type: "date",
        format: "L LT",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.DATE"),
        width: 185,
        alwaysVisible: true,
        sortable: true,
      },
    ]);

    function profileClick() {
      emit("page:open", {
        component: ImportProfileDetails,
      });
    }

    return {
      t,
      bladeToolbar,
      columns,
      importHistory,
    };
  },
});
</script>

<style lang="less" scoped></style>
