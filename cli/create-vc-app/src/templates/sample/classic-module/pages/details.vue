<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :expanded="expanded"
    :closable="closable"
    width="70%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="tw-p-2">
      <VcForm>
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
            class="tw-mb-4"
            @update:model-value="handleChange"
          ></VcInput>
        </Field>
        <VcCard
          header="Content"
          class="tw-mb-4"
        >
          <div class="tw-p-4">
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
                class="tw-mb-4"
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
import { IBladeToolbar, IParentCallArgs, useBeforeUnload, useBladeNavigation, usePopup } from "@vc-shell/framework";
import { useDetails } from "./../composables";
import { computed, onMounted, ref, unref, watch } from "vue";
import { Field, useForm, useIsFormDirty, useIsFormValid } from "vee-validate";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { MockedItem } from "../sample-data";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:blade"): void;
}

defineOptions({
  url: "/sample-details",
  name: "SampleDetails",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { loading, getItem, saveItem, removeItem, item, currencyOptions } = useDetails();
const { showConfirmation } = usePopup();
const { onBeforeClose } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });
useForm({
  validateOnMount: false,
});
useBeforeUnload(computed(() => !isDisabled.value && modified.value));

const modified = ref(false);
const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();
const isDisabled = computed(() => {
  return !isDirty.value || !isFormValid.value;
});
let itemCopy: MockedItem;
const title = computed(() => {
  return props.param
    ? item.value?.name
      ? item.value?.name + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS")
      : t("SAMPLE_APP.PAGES.DETAILS.TITLE.LOADING")
    : "Test App" + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS");
});

watch(
  () => item.value,
  (state) => {
    if (itemCopy) {
      modified.value = !_.isEqual(itemCopy, state);
    }
  },
  { deep: true },
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    icon: "fas fa-save",
    title: "Save",
    async clickHandler() {
      await saveItem(item.value);
      itemCopy = _.cloneDeep(item.value);
      modified.value = false;
      emit("parent:call", {
        method: "reload",
      });
      emit("close:blade");
    },
    disabled: computed(() => !(modified.value && !isDisabled.value)),
  },
  {
    id: "delete",
    icon: "fas fa-trash",
    title: "Delete",
    async clickHandler() {
      if (await showConfirmation(computed(() => t(`SAMPLE_APP.PAGES.ALERTS.DELETE`)))) {
        if (props.param) {
          await removeItem({ id: props.param });
          emit("parent:call", {
            method: "reload",
          });

          emit("close:blade");
        }
      }
    },
  },
]);

onMounted(async () => {
  if (props.param) {
    await getItem({ id: props.param });
    itemCopy = _.cloneDeep(item.value);
  }
});

onBeforeClose(async () => {
  if (!isDisabled.value && modified.value) {
    return await showConfirmation(unref(computed(() => t("SAMPLE_APP.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
  }
});

defineExpose({
  title,
});
</script>
