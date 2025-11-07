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
{{FORM_FIELDS}}
            </div>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  IParentCallArgs,
  useBladeNavigation,
  useBeforeUnload,
  usePopup,{{GALLERY_IMPORTS}}
} from "@vc-shell/framework";
import { use{{EntityName}}Details } from "../composables";
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
  name: "{{EntityName}}Details",
  url: "/{{entity-name}}",
});

const { t } = useI18n({ useScope: "global" });
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation, showInfo } = usePopup();
const { meta } = useForm({ validateOnMount: false });

const {
  item,
  loading,
  load{{EntityName}},
  save{{EntityName}},
  delete{{EntityName}},
  isModified,
  resetModificationState,
} = use{{EntityName}}Details();

{{GALLERY_SCRIPT_ADDITIONS}}

const bladeTitle = computed(() => {
  return t("{{MODULE_NAME_UPPERCASE}}.PAGES.DETAILS.TITLE");
});

const createdDate = computed(() => {
  const date = new Date(item.value?.createdDate ?? "");
  return moment(date).format("L LT");
});

const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "save",
    title: t("{{MODULE_NAME_UPPERCASE}}.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        const saved = await save{{EntityName}}(item.value);

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
        showInfo(t("{{MODULE_NAME_UPPERCASE}}.PAGES.ALERTS.NOT_VALID"));
      }
    },
    disabled: computed(() => !(meta.value.valid && isModified.value)),
  },
  {
    id: "delete",
    title: t("{{MODULE_NAME_UPPERCASE}}.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    async clickHandler() {
      if (
        props.param &&
        (await showConfirmation(t("{{MODULE_NAME_UPPERCASE}}.PAGES.ALERTS.DELETE")))
      ) {
        await delete{{EntityName}}(props.param);
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
      await load{{EntityName}}(newParam);
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (props.param) {
    await load{{EntityName}}(props.param);
  } else if (props.options?.item) {
    item.value = props.options.item;
    resetModificationState();
  }
});

onBeforeClose(async () => {
  if (isModified.value) {
    return await showConfirmation(
      t("{{MODULE_NAME_UPPERCASE}}.PAGES.ALERTS.CLOSE_CONFIRMATION")
    );
  }
  return true;
});

useBeforeUnload(computed(() => isModified.value));

defineExpose({
  title: bladeTitle,
});
</script>
