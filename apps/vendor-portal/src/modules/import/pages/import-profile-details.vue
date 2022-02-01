<template>
  <vc-blade
    v-loading="loading"
    :title="
      param && profileDetails
        ? profileDetails.name
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
              $t(
                'IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.TITLE'
              )
            "
            :placeholder="
              $t(
                'IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.PLACEHOLDER'
              )
            "
            :clearable="true"
            :required="true"
            :tooltip="
              $t(
                'IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.TOOLTIP'
              )
            "
            name="name"
            v-model="profileDetails.name"
          ></vc-input>
          <vc-select
            class="vc-padding_m"
            :label="
              $t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER.TITLE')
            "
            :clearable="true"
            :isRequired="true"
            :tooltip="
              $t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER.TOOLTIP')
            "
            name="importer"
            :options="dataImporters"
            :initialItem="importer"
            keyProperty="typeName"
            displayProperty="typeName"
            :isSearchable="true"
            v-model="profileDetails.typeName"
            @update:modelValue="setImporter"
          ></vc-select>
        </vc-col>
      </vc-row>
      <vc-row class="vc-padding_m" v-if="profileDetails.typeName">
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

              <vc-dynamic-property
                class="vc-padding-left_l vc-padding-right_l vc-padding-bottom_l"
                v-for="(setting, i) in profileDetails.settings"
                :key="`${profileDetails.id}_${i}`"
                :property="setting"
                :getter="getSettingsValue"
                :setter="setSettingsValue"
                :optionsGetter="loadDictionaries"
              >
              </vc-dynamic-property>
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
      @confirm="deleteProfile"
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
import { computed, defineComponent, onMounted, ref } from "vue";
import { IBladeToolbar } from "../../../types";
import { useI18n } from "@virtoshell/core";
import importConfirmationPopup from "../components/import-confirmation-popup.vue";
import useImport from "../composables/useImport";
import { IDataImporter, ObjectSettingEntry } from "../../../api_client";
import { useForm } from "@virtoshell/ui";

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
  emits: ["page:close", "parent:call"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const {
      dataImporters,
      profileDetails,
      loading,
      profile,
      modified,
      createImportProfile,
      loadImportProfile,
      deleteImportProfile,
      updateImportProfile,
      fetchDataImporters,
      setImporter,
    } = useImport();
    const { validate } = useForm({ validateOnMount: false });
    const importer = ref<IDataImporter>();
    const showConfirmation = ref(false);
    const bladeToolbar = ref<IBladeToolbar[]>([
      {
        id: "save",
        title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.SAVE")),
        icon: "fas fa-save",
        async clickHandler() {
          const { valid } = await validate();
          if (valid) {
            try {
              if (props.param) {
                await updateImportProfile(profileDetails);
                emit("parent:call", {
                  method: "reloadParent",
                });
              } else {
                await createImportProfile(profileDetails);
                emit("parent:call", {
                  method: "reload",
                });
              }
              emit("page:close");
            } catch (err) {
              alert(err.message);
            }
          }
        },
        disabled: computed(() => {
          return (
            (props.param && !modified.value) ||
            (!props.param && !modified.value)
          );
        }),
      },
      {
        id: "cancel",
        title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.CANCEL")),
        icon: "fas fa-ban",
        clickHandler() {
          emit("page:close");
        },
      },
      {
        id: "delete",
        title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.DELETE")),
        icon: "far fa-trash-alt",
        isVisible: computed(() => !!props.param),
        clickHandler() {
          showConfirmation.value = true;
        },
      },
    ]);

    const sampleTemplateUrl = computed(() => {
      return importer.value ? importer.value.metadata.sampleCsvUrl : "#";
    });

    onMounted(async () => {
      await fetchDataImporters();
      if (props.param) {
        await loadImportProfile({ id: props.param });
      }
    });

    function getSettingsValue(setting: ObjectSettingEntry) {
      return setting.value;
    }

    function setSettingsValue(
      setting: ObjectSettingEntry,
      value: string | boolean
    ) {
      setting.value = value;
    }

    function loadDictionaries(setting: ObjectSettingEntry) {
      if (setting.allowedValues && setting.allowedValues.length) {
        return setting.allowedValues.map((val) => ({
          id: val,
          alias: val,
        }));
      }
    }

    async function deleteProfile() {
      showConfirmation.value = false;
      await deleteImportProfile({ id: props.param });

      emit("parent:call", {
        method: "reloadParent",
      });
      emit("page:close");
    }

    return {
      title: computed(() =>
        props.options.importer
          ? props.options.importer.typeName
          : t("IMPORT.PAGES.PROFILE_DETAILS.TITLE")
      ),
      bladeToolbar,
      showConfirmation,
      dataImporters,
      importer: computed(() => profile.value.importer),
      sampleTemplateUrl,
      profileDetails,
      loading,
      setImporter,
      getSettingsValue,
      setSettingsValue,
      loadDictionaries,
      deleteProfile,
    };
  },
});
</script>

<style lang="less" scoped></style>
