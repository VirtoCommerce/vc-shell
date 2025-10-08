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
        <!-- You can add form fields here -->
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar, IParentCallArgs, useBladeNavigation, usePopup, useBeforeUnload } from "@vc-shell/framework";
import { use{{ModuleNamePascalCase}}Details } from "./../composables";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";

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
  url: "/{{ModuleName}}-details",
  name: "{{ModuleNamePascalCase}}Details",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

defineEmits<Emits>();

const { loading, getItem, isModified } = use{{ModuleNamePascalCase}}Details();
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

const { meta } = useForm({
  validateOnMount: false,
});

const isDisabled = computed(() => {
  return !meta.value.dirty || !meta.value.valid;
});

const bladeToolbar = ref<IBladeToolbar[]>([]);
const title = computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.DETAILS.TITLE"));

onMounted(async () => {
  if (props.param) {
    await getItem({ id: props.param });
  }
});

onBeforeClose(async () => {
  if (!isDisabled.value && isModified.value) {
    return await showConfirmation(t("SAMPLE_APP.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
});

useBeforeUnload(computed(() => !isDisabled.value && isModified.value));

defineExpose({
  title,
});
</script>
