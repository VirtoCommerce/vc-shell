<template>
  <vc-blade
    :title="
      options.importer
        ? options.importer.typeName
        : $t('IMPORT.PAGES.PROFILE_DETAILS.TITLE')
    "
    width="30%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
    :closable="closable"
    :expanded="expanded"
  >
    <vc-container>
      <vc-row>
        <vc-col>
          <vc-input
            class="vc-padding_m"
            :label="
              $t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME')
            "
            :clearable="true"
            :required="true"
            tooltip="text"
            name="profile_name"
          ></vc-input>
          <vc-select
            class="vc-padding_m"
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER')"
            :clearable="true"
            :isRequired="true"
            tooltip="text"
            name="importer"
            :options="importersList"
            keyProperty="typeName"
            displayProperty="typeName"
            :isSearchable="true"
            v-model="importer"
          ></vc-select>
        </vc-col>
      </vc-row>
      <vc-row class="vc-padding_m" v-if="importer">
        <vc-card
          :header="$t('IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.TITLE')"
        >
          <vc-row>
            <vc-col>
              <div class="vc-padding_l">
                <a class="vc-link" :href="sampleTemplateUrl">{{
                  $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE")
                }}</a>
                {{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
              </div>
              <vc-select
                class="vc-padding-left_l vc-padding-right_l vc-padding-bottom_l"
                :label="
                  $t(
                    'IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.DECIMAL_SEPARATOR'
                  )
                "
                :clearable="true"
                tooltip="text"
                name="job"
              ></vc-select>
              <vc-input
                class="vc-padding-left_l vc-padding-right_l vc-padding-bottom_l"
                :label="
                  $t('IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.SHEET_NAME')
                "
                :clearable="true"
                tooltip="text"
                name="job_code"
              ></vc-input>
              <vc-input
                class="vc-padding-left_l vc-padding-right_l vc-padding-bottom_l"
                :label="
                  $t(
                    'IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.DATE_FORMAT'
                  )
                "
                :clearable="true"
                tooltip="text"
                name="job_name"
              ></vc-input>
            </vc-col>
          </vc-row>
        </vc-card>
      </vc-row>
    </vc-container>
    <import-confirmation-popup
      v-if="showConfirmation"
      :title="
        $t('IMPORT.PAGES.PROFILE_DETAILS.CONFIRM_POPUP.DELETE_IMPORTER.TITLE')
      "
      @close="showConfirmation = false"
    >
      <template v-slot:description>
        <p>
          {{
            $t(
              "IMPORT.PAGES.PROFILE_DETAILS.CONFIRM_POPUP.DELETE_IMPORTER.DESCRIPTION"
            )
          }}
        </p>
      </template>
    </import-confirmation-popup>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { IBladeToolbar } from "../../../types";
import { useI18n } from "@virtoshell/core";
import importConfirmationPopup from "../components/import-confirmation-popup.vue";
import useImport from "../composables/useImport";
import { IDataImporter } from "../../../api_client";

export default defineComponent({
  components: { importConfirmationPopup },
  url: "import-profile-details",
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
  emits: ["page:close"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { fetchDataImporters } = useImport();
    const importer = ref("");
    const importersList = ref<IDataImporter[]>([]);
    const showConfirmation = ref(false);
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "save",
        title: t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
      },
      {
        id: "cancel",
        title: t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.CANCEL"),
        icon: "fas fa-ban",
        clickHandler() {
          emit("page:close");
        },
      },
      {
        id: "delete",
        title: t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.DELETE"),
        icon: "far fa-trash-alt",
        isVisible: computed(() => !!props.options.importer),
        clickHandler() {
          showConfirmation.value = true;
        },
      },
    ]);

    const sampleTemplateUrl = computed(() => {
      const importerItem = importersList.value.find(
        (imp) => imp.typeName === importer.value
      );

      return importerItem ? importerItem.metadata.sampleCsvUrl : "#";
    });

    onMounted(async () => {
      importersList.value = await fetchDataImporters();
    });

    return {
      bladeToolbar,
      showConfirmation,
      importersList,
      importer,
      sampleTemplateUrl,
    };
  },
});
</script>

<style lang="less" scoped></style>
