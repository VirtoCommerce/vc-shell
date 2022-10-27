<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="loading"
    @close="$emit('page:close')"
    :closable="closable"
    :expanded="expanded"
    :toolbarItems="bladeToolbar"
  >
    <VcContainer>
      <VcStatus
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="w-full box-border mb-3"
        v-if="errorMessage"
      >
        <div class="flex flex-row items-center">
          <VcIcon
            icon="fas fa-exclamation-circle"
            class="text-[#ff4a4a] mr-3"
            size="xxl"
          ></VcIcon>
          <div>
            <div class="font-bold">
              {{ $t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcForm>
        <VcRow>
          <VcCol>
            <VcInput
              class="p-3"
              :label="
                $t('SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL')
              "
              :placeholder="
                $t(
                  'SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.PLACEHOLDER'
                )
              "
              :required="true"
              name="name"
              v-model="fulfillmentCenterDetails.name"
            >
            </VcInput>
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
import { computed, ref, onMounted, unref } from "vue";
import { IBladeToolbar } from "../../../../types";
import { useI18n, useLogger } from "@vc-shell/core";
import useFulfillmentCenters from "../../composables/useFulfillmentCenters";
import WarningPopup from "../../components/WarningPopup.vue";
import { useForm } from "@vc-shell/ui";
import { useIsFormValid } from "vee-validate";
import useSellerDetails from "../../composables/useSellerDetails";

const props = defineProps({
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

const emit = defineEmits(["page:close", "parent:call"]);
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
  props.param
    ? fulfillmentCenterDetails.value.name
    : t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TITLE")
);

const deleteModal = ref(false);
const errorMessage = ref("");
const isValid = useIsFormValid();
const logger = useLogger();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() =>
      t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.SAVE")
    ),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        try {
          await updateFulfillmentCenter(fulfillmentCenterDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
        } catch (e) {
          logger.error(e);
        }
      } else {
        alert(
          unref(
            computed(() =>
              t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NOT_VALID")
            )
          )
        );
      }
    },
    isVisible: true,
    disabled: computed(() => props.param && !(isValid.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() =>
      t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.RESET")
    ),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() =>
      t("SETTINGS.FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.DELETE")
    ),
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
    emit("page:close");
  }
}

async function onBeforeClose() {
  if (modified.value) {
    const confirmationStatus = confirm(
      unref(
        computed(() =>
          t("SETTINGS.FULFILLMENT_CENTERS.ALERTS.CLOSE_CONFIRMATION")
        )
      )
    );
    return confirmationStatus;
  }
}

defineExpose({
  onBeforeClose,
});
</script>
