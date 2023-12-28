<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="30%"
    :closable="closable"
    :expanded="expanded"
    :toolbar-items="bladeToolbar"
    :expandable="false"
    @close="$emit('close:blade')"
  >
    <template
      v-if="$slots['error']"
      #error
    >
      <slot name="error"></slot>
    </template>
    <VcContainer>
      <VcStatus
        v-if="errorMessage"
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="tw-w-full tw-box-border tw-mb-3"
      >
        <div class="tw-flex tw-flex-row tw-items-center">
          <VcIcon
            icon="fas fa-exclamation-circle"
            class="tw-text-[#ff4a4a] tw-mr-3"
            size="xxl"
          ></VcIcon>
          <div>
            <div class="tw-font-bold">
              {{ $t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcForm>
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL')"
              name="name"
              rules="required"
              :model-value="fulfillmentCenterDetails.name"
            >
              <VcInput
                v-bind="field"
                v-model="fulfillmentCenterDetails.name"
                class="tw-p-3"
                :label="$t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL')"
                :placeholder="$t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.PLACEHOLDER')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              >
              </VcInput>
            </Field>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, unref } from "vue";
import { IBladeToolbar, IParentCallArgs, usePopup, useBeforeUnload } from "@vc-shell/framework";
import useFulfillmentCenters from "../../composables/useFulfillmentCenters";
import { Field, useIsFormValid, useIsFormDirty, useForm } from "vee-validate";
import { useSellerDetails } from "./../../../seller-details/composables";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "FulfillmentCenterDetails",
});

useForm({ validateOnMount: false });

const { showError, showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });
const {
  fulfillmentCenterDetails,
  loading,
  modified,
  getFulfillmentCenter,
  updateFulfillmentCenter,
  deleteFulfillmentCenter,
  resetEntries,
  handleFulfillmentCenterItem,
} = useFulfillmentCenters();

const { item } = useSellerDetails();

const title = computed(() =>
  props.param ? fulfillmentCenterDetails.value.name : t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TITLE"),
);

const errorMessage = ref("");
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
useBeforeUnload(computed(() => !isDisabled.value && modified.value));

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        await updateFulfillmentCenter(fulfillmentCenterDetails.value);
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      } else {
        showError(unref(computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NOT_VALID"))));
      }
    },
    isVisible: true,
    disabled: computed(() => !!props.param && !(!isDisabled.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => !!props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      if (await showConfirmation(computed(() => t("SETTINGS.FULFILLMENT_CENTERS.ALERTS.FC_DELETE")))) {
        removeFulfillmentCenter();
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => true),
  },
]);

onMounted(async () => {
  if (props.param) {
    await getFulfillmentCenter(props.param);
  } else {
    fulfillmentCenterDetails.value.organizationId = item.value?.id;
  }
  handleFulfillmentCenterItem(fulfillmentCenterDetails.value);
});

async function removeFulfillmentCenter() {
  if (props.param) {
    await deleteFulfillmentCenter({ id: props.param });
    emit("parent:call", {
      method: "reload",
    });
    emit("close:blade");
  }
}

onBeforeRouteLeave(async (to, from) => {
  if (modified.value) {
    return await showConfirmation(unref(computed(() => t("SETTINGS.FULFILLMENT_CENTERS.ALERTS.CLOSE_CONFIRMATION"))));
  }
});
</script>
