<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <VcContainer>
      <VcRow>
        <VcCol class="m-2">
          <VcCard :header="$t('SETTINGS.ORGANIZATION.CARDS.INFO.TITLE')">
            <div class="p-2">
              <VcForm>
                <VcInput
                  class="m-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_NAME.LABEL'
                    )
                  "
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER'
                    )
                  "
                >
                </VcInput>
                <VcRow>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL'
                        )
                      "
                      :clearable="true"
                      :required="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER'
                        )
                      "
                    >
                    </VcInput>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL'
                        )
                      "
                      :clearable="true"
                      :required="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol class="m-2">
                    <VcLabel class="mb-2">
                      <span>{{
                        $t("SETTINGS.ORGANIZATION.CARDS.INFO.FORM.UPLOAD.LABEL")
                      }}</span>
                    </VcLabel>
                    <VcFileUpload
                      variant="file-upload"
                      class="h-[100px] flex-row"
                    ></VcFileUpload>
                    <VcHint class="mt-1">{{
                      $t(
                        "SETTINGS.ORGANIZATION.CARDS.INFO.FORM.UPLOAD.DESCRIPTION"
                      )
                    }}</VcHint>
                  </VcCol>
                </VcRow>
                <VcTextarea
                  class="mb-4 mx-2"
                  :label="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.ABOUT.LABEL')
                  "
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.ABOUT.PLACEHOLDER'
                    )
                  "
                >
                </VcTextarea>
                <VcTextarea
                  class="mb-4 mx-2"
                  :label="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.DELIVERY.LABEL')
                  "
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.DELIVERY.PLACEHOLDER'
                    )
                  "
                >
                </VcTextarea>
              </VcForm>
            </div>
          </VcCard>
        </VcCol>
        <VcCol class="m-2">
          <VcCard :header="$t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.TITLE')">
            <VcForm>
              <div class="p-2">
                <VcRow>
                  <VcCol>
                    <VcSelect
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.COUNTRY.LABEL'
                        )
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER'
                        )
                      "
                    ></VcSelect>
                  </VcCol>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ZIP.LABEL')
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER'
                        )
                      "
                    ></VcInput>
                  </VcCol>
                </VcRow>
                <VcRow>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.STATE.LABEL'
                        )
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol>
                    <VcInput
                      class="p-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.CITY.LABEL'
                        )
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                </VcRow>
                <VcInput
                  class="p-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL'
                    )
                  "
                  :clearable="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER'
                    )
                  "
                >
                </VcInput>
                <VcInput
                  class="p-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL'
                    )
                  "
                  :clearable="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER'
                    )
                  "
                >
                </VcInput>
                <div class="m-2 mb-2">
                  <VcInput
                    :label="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.LABEL'
                      )
                    "
                    :clearable="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER'
                      )
                    "
                  >
                  </VcInput>
                  <VcHint class="mt-1">{{
                    $t(
                      "SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.DESCRIPTION"
                    )
                  }}</VcHint>
                </div>
              </div>
              <VcRow class="border-t-[1px] border-t-[#EAEEF2]">
                <VcCol class="">
                  <VcInput
                    class="mt-4 mx-4"
                    :label="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.PHONE.LABEL')
                    "
                    :clearable="true"
                    :required="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER'
                      )
                    "
                  >
                  </VcInput>
                </VcCol>
                <VcCol class="">
                  <VcInput
                    class="mt-4 mx-4"
                    :label="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.EMAIL.LABEL')
                    "
                    :clearable="true"
                    :required="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER'
                      )
                    "
                  >
                  </VcInput>
                </VcCol>
              </VcRow>
            </VcForm>
          </VcCard>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";

export default defineComponent({
  url: "organization",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";

defineProps({
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
});
defineEmits(["page:close", "page:open"]);

const { t } = useI18n();
const title = t("SETTINGS.ORGANIZATION.TITLE");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.ORGANIZATION.TOOLBAR.SAVE")),
    icon: "fas fa-save",
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.ORGANIZATION.TOOLBAR.RESET")),
    icon: "fas fa-undo",
  },
]);

defineExpose({
  title,
});
</script>

<style lang="scss" scoped></style>
