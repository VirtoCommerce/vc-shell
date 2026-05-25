<template>
  <VcBlade
    :loading="loading"
    :title="title"
    width="70%"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer class="tw-p-2">
      <VcForm class="tw-space-y-4">
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          name="name"
          :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.NAME')"
          rules="required"
          :model-value="item.name"
        >
          <VcInput
            v-model="item.name"
            :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.NAME')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          ></VcInput>
        </Field>
        <VcCard header="Content">
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              name="guid"
              :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.GUID')"
              :rules="{
                required: true,
                regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
              }"
              :model-value="item.guid"
            >
              <VcInput
                v-model="item.guid"
                :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.GUID')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              ></VcInput>
            </Field>
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              name="description"
              :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.DESCRIPTION')"
              :rules="{
                required: true,
              }"
              :model-value="item.description"
            >
              <VcTextarea
                v-model="item.description"
                :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.DESCRIPTION')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              ></VcTextarea>
            </Field>
          </div>
        </VcCard>
        <VcCard
          v-if="item.currency"
          header="Prices"
        >
          <VcRow class="tw-p-4 tw-gap-4">
            <VcCol :size="2">
              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                name="price"
                :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.PRICE')"
                :rules="{
                  required: true,
                }"
                :model-value="item.price"
              >
                <VcInputCurrency
                  v-model="item.price"
                  v-model:option="item.currency"
                  :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.PRICE')"
                  required
                  option-value="value"
                  option-label="label"
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :options="currencyOptions"
                  @update:model-value="handleChange"
                ></VcInputCurrency>
              </Field>
            </VcCol>
            <VcCol :size="2">
              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                name="salePrice"
                :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.SALE_PRICE')"
                :rules="{
                  required: true,
                }"
                :model-value="item.salePrice"
              >
                <VcInputCurrency
                  v-model="item.salePrice"
                  v-model:option="item.currency"
                  :label="$t('SAMPLE_APP.PAGES.DETAILS.FIELDS.SALE_PRICE')"
                  required
                  option-value="value"
                  option-label="label"
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :options="currencyOptions"
                  @update:model-value="handleChange"
                ></VcInputCurrency>
              </Field>
            </VcCol>
          </VcRow>
        </VcCard>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar, useBlade, useBladeForm, usePopup } from "@vc-shell/framework";
import {
  VcBlade,
  VcCard,
  VcCol,
  VcContainer,
  VcForm,
  VcInput,
  VcInputCurrency,
  VcRow,
  VcTextarea,
} from "@vc-shell/framework/ui";
import { useDetails } from "./../composables";
import { computed, onMounted, ref } from "vue";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

defineBlade({
  name: "SampleDetails",
  url: "/sample-details",
});

const { param, closeSelf, callParent } = useBlade();

const { loading, getItem, saveItem, removeItem, item, currencyOptions } = useDetails();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

const form = useBladeForm({
  data: item,
  closeConfirmMessage: computed(() => t("SAMPLE_APP.PAGES.ALERTS.CLOSE_CONFIRMATION")),
});

const title = computed(() => {
  return param.value
    ? item.value?.name
      ? item.value?.name + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS")
      : t("SAMPLE_APP.PAGES.DETAILS.TITLE.LOADING")
    : "Test App" + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS");
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    icon: "lucide-save",
    title: "Save",
    async clickHandler() {
      await saveItem(item.value);
      form.setBaseline();
      callParent("reload");
      closeSelf();
    },
    disabled: computed(() => !form.canSave.value),
  },
  {
    id: "delete",
    icon: "lucide-trash-2",
    title: "Delete",
    async clickHandler() {
      if (await showConfirmation(t(`SAMPLE_APP.PAGES.ALERTS.DELETE`))) {
        if (param.value) {
          await removeItem({ id: param.value });
          callParent("reload");

          closeSelf();
        }
      }
    },
  },
]);

onMounted(async () => {
  if (param.value) {
    await getItem({ id: param.value });
    form.setBaseline();
  }
});
</script>
