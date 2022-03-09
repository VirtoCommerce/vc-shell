<template>
  <VcBlade
    :title="contentItem.name"
    width="30%"
    @close="$emit('page:close')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div class="vc-flex-grow_1">
        <div class="vc-padding_l">
          <VcForm>
            <VcInput
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_ITEM_NAME.LABEL'
                )
              "
            >
            </VcInput>
            <VcTextarea
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.DESCRIPTION.LABEL'
                )
              "
            >
            </VcTextarea>
            <VcSelect
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_TYPE.LABEL'
                )
              "
            ></VcSelect>
            <VcTextarea
              class="vc-margin-bottom_l"
              :label="
                $t('DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.HTML.LABEL')
              "
            >
            </VcTextarea>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from "vue";

export default defineComponent({
  url: "item",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";

defineProps({
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
const { t } = useI18n();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const title = computed(() => contentItem.name);
const contentItem = {
  id: "819a8174c9cd4b7d8955",
  name: "Home Page",
  created: Date.now(),
  description: "Index store page",
  path: "ContentItem\\Home Page",
};

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.SAVE"),
    icon: "fas fa-save",
    clickHandler() {
      alert("save");
    },
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      alert("reset");
    },
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    clickHandler() {
      alert("delete");
    },
  },
  {
    id: "typeProps",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.TYPE_PROPERTIES"),
    icon: "fas fa-download",
    clickHandler() {
      alert("type properties");
    },
  },
]);
</script>

<style lang="less" scoped></style>
