<template>
  <VcBlade
    v-loading="loading"
    :title="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.DETAILS.TITLE')"
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
import { IBladeToolbar, IParentCallArgs } from "@vc-shell/framework";
import { use{{ModuleNamePascalCase}}Details } from "./../composables";
import { onMounted, ref } from "vue";

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

const { loading, getItem } = use{{ModuleNamePascalCase}}Details();

const bladeToolbar = ref<IBladeToolbar[]>([]);

onMounted(async () => {
  if (props.param) {
    await getItem({ id: props.param });
  }
});
</script>
