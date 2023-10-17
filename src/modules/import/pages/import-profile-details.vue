<template>
  <VcBlade
    v-loading="loading"
    :title="param && profileDetails ? profileDetails.name : $t('IMPORT.PAGES.PROFILE_DETAILS.TITLE')"
    width="50%"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer>
      <VcRow>
        <VcCol>
          <Field
            v-slot="{ field, errorMessage, handleChange, errors }"
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.TITLE')"
            rules="required"
            name="profile_name"
            :model-value="profileDetails.name"
          >
            <VcInput
              v-bind="field"
              v-model="profileDetails.name"
              class="tw-p-3"
              :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.TITLE')"
              :placeholder="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.PLACEHOLDER')"
              :clearable="true"
              :tooltip="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.PROFILE_NAME.TOOLTIP')"
              :error="!!errors.length"
              :error-message="errorMessage"
              required
              @update:model-value="handleChange"
            ></VcInput>
          </Field>
          <Field
            v-slot="{ field, handleChange }"
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER.TITLE')"
            rules="required"
            name="importer"
            :model-value="profileDetails.dataImporterType"
          >
            <VcSelect
              v-bind="field"
              v-model="profileDetails.dataImporterType"
              class="tw-p-3"
              :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER.TITLE')"
              :tooltip="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.IMPORTER.TOOLTIP')"
              :options="dataImporters"
              option-value="typeName"
              option-label="typeName"
              required
              searchable
              :clearable="false"
              @update:model-value="
                (e) => {
                  handleChange(e);
                  setImporter(e as string);
                }
              "
            ></VcSelect>
          </Field>
        </VcCol>
      </VcRow>
      <VcRow
        v-if="profileDetails.dataImporterType"
        class="tw-p-3"
      >
        <VcCard :header="$t('IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.TITLE')">
          <VcRow>
            <VcCol>
              <div class="tw-p-4">
                <a
                  class="vc-link"
                  :href="sampleTemplateUrl"
                  >{{ $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE") }}</a
                >
                {{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
              </div>

              <VcDynamicProperty
                v-for="(setting, i) in profileDetails.settings"
                :key="`${profileDetails.id}_${i}`"
                class="tw-px-4 tw-pb-4"
                :property="setting"
                :dictionary="setting.isDictionary"
                :disabled="setting.isReadOnly"
                :name="setting.name"
                :options-getter="loadDictionaries"
                :model-value="setting.value"
                :required="setting.isRequired"
                :value-type="setting.valueType"
                :placeholder="setting.defaultValue"
                @update:model-value="setSettingsValue"
              >
              </VcDynamicProperty>
            </VcCol>
          </VcRow>
        </VcCard>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, unref } from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  VcInput,
  VcSelect,
  VcBlade,
  VcContainer,
  VcRow,
  VcCol,
  VcDynamicProperty,
  usePopup,
} from "@vc-shell/framework";
import useImport from "../composables/useImport";
import { IDataImporter, ObjectSettingEntry } from "vc-vendor-portal-api/marketplacevendor";
import { useIsFormValid, Field, useForm, useIsFormDirty } from "vee-validate";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
    importer: IDataImporter;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

defineOptions({
  url: "/import-profile-details",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
  options: undefined,
});

const emit = defineEmits<Emits>();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });
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

useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        if (props.param) {
          await updateImportProfile(profileDetails.value);
          emit("parent:call", {
            method: "reloadParent",
          });
        } else {
          await createImportProfile(profileDetails.value);
          emit("parent:call", {
            method: "reload",
          });
        }
        emit("close:blade");
      }
    },
    disabled: computed(() => {
      return isDisabled.value || (props.param && !modified.value) || (!props.param && !modified.value);
    }),
  },
  {
    id: "cancel",
    title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.CANCEL")),
    icon: "fas fa-ban",
    clickHandler() {
      emit("close:blade");
    },
    isVisible: computed(() => !props.param),
  },
  {
    id: "delete",
    title: computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.DELETE")),
    icon: "far fa-trash-alt",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      if (
        await showConfirmation(
          computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.CONFIRM_POPUP.DELETE_IMPORTER.DESCRIPTION"))
        )
      ) {
        deleteProfile();
      }
    },
  },
]);

const sampleTemplateUrl = computed(() => {
  const importer = dataImporters.value.find((x) => x.typeName === profileDetails.value.dataImporterType);
  return profile.value.importer
    ? profile.value.importer.metadata && profile.value.importer.metadata.sampleCsvUrl
    : importer
    ? importer.metadata && importer.metadata.sampleCsvUrl
    : "#";
});

const title = computed(() =>
  props.options.importer ? props.options.importer.typeName : t("IMPORT.PAGES.PROFILE_DETAILS.TITLE")
);

onMounted(async () => {
  await fetchDataImporters();
  if (props.param) {
    await loadImportProfile({ id: props.param });
  }
});

function setSettingsValue(data: { property: ObjectSettingEntry; value: string | boolean }) {
  const { property, value } = data;

  const mutatedSetting = new ObjectSettingEntry({ ...property, value });

  profileDetails.value.settings.forEach((x) => {
    if (x.id === property.id) {
      Object.assign(x, mutatedSetting);
    }
  });
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
  await deleteImportProfile({ id: props.param });

  emit("parent:call", {
    method: "reloadParent",
  });
  emit("close:blade");
}

async function onBeforeClose() {
  if (modified.value) {
    return await showConfirmation(unref(computed(() => t("IMPORT.PAGES.PROFILE_DETAILS.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

defineExpose({
  onBeforeClose,
  title,
});
</script>
