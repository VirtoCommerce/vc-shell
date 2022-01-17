<template>
  <vc-blade
    :title="$t('IMPORT.PAGES.PROFILE_DETAILS.TITLE')"
    width="70%"
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
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.JOB_CODE')"
            :clearable="true"
            :required="true"
            tooltip="text"
            name="job_code"
          ></vc-input>
          <vc-input
            class="vc-padding_m"
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.JOB_NAME')"
            :clearable="true"
            :required="true"
            tooltip="text"
            name="job_name"
          ></vc-input>
          <vc-select
            class="vc-padding_m"
            :label="$t('IMPORT.PAGES.PROFILE_DETAILS.IMPORT_INPUTS.JOB')"
            :clearable="true"
            :isRequired="true"
            tooltip="text"
            name="job"
          ></vc-select>
        </vc-col>
        <vc-col></vc-col>
        <vc-col></vc-col>
      </vc-row>
      <vc-row class="vc-padding_m">
        <vc-card
          :header="$t('IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.TITLE')"
        >
          <vc-row>
            <vc-col>
              <vc-select
                class="vc-padding_m"
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
                class="vc-padding_m"
                :label="
                  $t('IMPORT.PAGES.PROFILE_DETAILS.PROFILE_SETTINGS.SHEET_NAME')
                "
                :clearable="true"
                tooltip="text"
                name="job_code"
              ></vc-input>
              <vc-input
                class="vc-padding_m"
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
            <vc-col></vc-col>
            <vc-col class="vc-flex-align_end vc-padding_m">
              <div>
                <vc-link href="#">{{
                  $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE")
                }}</vc-link>
                {{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
              </div>
            </vc-col>
          </vc-row>
        </vc-card>
      </vc-row>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { IBladeToolbar } from "../../../types";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
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
  setup() {
    const { t } = useI18n();
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "save",
        title: t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-check",
      },
      {
        id: "refresh",
        title: t("IMPORT.PAGES.PROFILE_DETAILS.TOOLBAR.CANCEL"),
        icon: "fas fa-ban",
      },
    ]);

    return {
      bladeToolbar,
    };
  },
});
</script>

<style lang="less" scoped></style>
