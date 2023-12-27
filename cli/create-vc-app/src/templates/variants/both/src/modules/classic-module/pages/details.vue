<template>
  <VcBlade
    v-loading="loading"
    :title="item.name"
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
        <VcInput
          :model-value="item.name"
          label="Name"
          class="tw-mb-4"
        ></VcInput>
        <VcInput
          :model-value="item.createdDate"
          label="Date"
          type="datetime-local"
        ></VcInput>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar, IParentCallArgs } from "@vc-shell/framework";
import { useDetails } from "./../composables";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

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
  url: "/classic-module-details",
  name: "ClassicModuleDetails",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { item, loading, getItem } = useDetails();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("MODULE.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await getItem({ id: props.param });
    },
  },
]);

onMounted(async () => {
  if (props.param) {
    await getItem({ id: props.param });
  }
});
</script>

<style lang="scss" scoped></style>
