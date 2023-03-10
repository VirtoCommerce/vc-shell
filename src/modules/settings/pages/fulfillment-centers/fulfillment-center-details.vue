<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="loading"
    @close="$emit('close:blade')"
    :closable="closable"
    :expanded="expanded"
    :toolbarItems="bladeToolbar"
  >
    <VcContainer>
      <VcStatus
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="tw-w-full tw-box-border tw-mb-3"
        v-if="errorMessage"
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
              :modelValue="fulfillmentCenterDetails.name"
            >
              <VcInput
                v-bind="field"
                class="tw-p-3"
                :label="$t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL')"
                :placeholder="$t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.PLACEHOLDER')"
                v-model="fulfillmentCenterDetails.name"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:modelValue="handleChange"
              >
              </VcInput>
            </Field>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
  <WarningPopup
    v-if="deleteModal"
    @close="deleteModal = false"
    @delete="removeFulfillmentCenter"
  ></WarningPopup>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, unref } from "vue";
import { IBladeToolbar, IParentCallArgs, useForm, useI18n } from "@vc-shell/framework";
import useFulfillmentCenters from "../../composables/useFulfillmentCenters";
import WarningPopup from "../../components/WarningPopup.vue";
import { Field, useIsFormValid } from "vee-validate";
import useSellerDetails from "../../composables/useSellerDetails";

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
useForm({ validateOnMount: false });

const { t } = useI18n();
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

const { getCurrentSeller, sellerDetails } = useSellerDetails();

const title = computed(() =>
  props.param ? fulfillmentCenterDetails.value.name : t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TITLE")
);

const deleteModal = ref(false);
const errorMessage = ref("");
const isValid = useIsFormValid();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        try {
          await updateFulfillmentCenter(fulfillmentCenterDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(unref(computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NOT_VALID"))));
      }
    },
    isVisible: true,
    disabled: computed(() => props.param && !(isValid.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    clickHandler() {
      deleteModal.value = true;
    },
    isVisible: !!props.param,
    disabled: computed(() => true),
  },
]);

onMounted(async () => {
  if (props.param) {
    await getFulfillmentCenter(props.param);
  } else {
    await getCurrentSeller();
    fulfillmentCenterDetails.value.organizationId = sellerDetails.value?.id;
  }
  handleFulfillmentCenterItem(fulfillmentCenterDetails.value);
});

async function removeFulfillmentCenter() {
  if (props.param) {
    deleteModal.value = false;
    await deleteFulfillmentCenter({ id: props.param });
    emit("parent:call", {
      method: "reload",
    });
    emit("close:blade");
  }
}

async function onBeforeClose() {
  if (modified.value) {
    return confirm(unref(computed(() => t("SETTINGS.FULFILLMENT_CENTERS.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

defineExpose({
  onBeforeClose,
});
</script>
