<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    :modified="isModified"
    width="70%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="tw-p-2">
      <VcRow class="tw-space-x-4">
        <VcCol :size="6">
          <!-- Main Form -->
          <div class="tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('OFFERS.PAGES.DETAILS.FORM.INFO.NAME')"
              :model-value="item.name"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.name"
                :label="$t('OFFERS.PAGES.DETAILS.FORM.INFO.NAME')"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FORM.INFO.NAME_PLACEHOLDER')"
                required
                clearable
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <VcField
              :label="$t('OFFERS.PAGES.DETAILS.FORM.INFO.CREATED_DATE')"
              :model-value="createdDate"
              orientation="horizontal"
              :aspect-ratio="[1, 2]"
              type="text"
            />
          </div>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, IParentCallArgs, useBladeNavigation, useBeforeUnload, usePopup } from "@vc-shell/framework";
import { useOfferDetails } from "../composables";
import { Field, useForm } from "vee-validate";
import moment from "moment";

// TODO: Replace with your actual types
// Example: import { IProduct } from "@your-app/api/products";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "OfferDetails",
  url: "/offer",
});

const { t } = useI18n({ useScope: "global" });
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation, showInfo } = usePopup();
const { meta } = useForm({ validateOnMount: false });

const { item, loading, loadOffer, saveOffer, deleteOffer, isModified, resetModificationState } = useOfferDetails();

const bladeTitle = computed(() => {
  return t("OFFERS.PAGES.DETAILS.TITLE");
});

const createdDate = computed(() => {
  const date = new Date(item.value?.createdDate ?? "");
  return moment(date).format("L LT");
});

const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "save",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        const saved = await saveOffer(item.value);

        if (!props.param && saved?.id) {
          emit("parent:call", {
            method: "onItemClick",
            args: { id: saved.id },
          });
        }

        resetModificationState();
        emit("parent:call", { method: "reload" });

        if (!props.param) {
          emit("close:blade");
        }
      } else {
        showInfo(t("OFFERS.PAGES.ALERTS.NOT_VALID"));
      }
    },
    disabled: computed(() => !(meta.value.valid && isModified.value)),
  },
  {
    id: "delete",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    async clickHandler() {
      if (props.param && (await showConfirmation(t("OFFERS.PAGES.ALERTS.DELETE")))) {
        await deleteOffer(props.param);
        emit("parent:call", { method: "reload" });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!props.param),
  },
]);

watch(
  () => props.param,
  async (newParam) => {
    if (newParam) {
      await loadOffer(newParam);
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  if (props.param) {
    await loadOffer(props.param);
  } else if (props.options?.item) {
    item.value = props.options.item;
    resetModificationState();
  }
});

onBeforeClose(async () => {
  if (isModified.value) {
    return await showConfirmation(t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
  return true;
});

useBeforeUnload(computed(() => isModified.value));

defineExpose({
  title: bladeTitle,
});
</script>
