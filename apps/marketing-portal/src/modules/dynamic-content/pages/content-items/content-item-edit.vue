<template>
  <vc-blade
    :title="contentItem.name"
    width="30%"
    @close="$emit('page:close')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <vc-container :no-padding="true">
      <div class="vc-flex-grow_1">
        <div class="vc-padding_l">
          <vc-form>
            <vc-input
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_ITEM_NAME.LABEL'
                )
              "
            >
            </vc-input>
            <vc-textarea
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.DESCRIPTION.LABEL'
                )
              "
            >
            </vc-textarea>
            <vc-select
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_TYPE.LABEL'
                )
              "
            ></vc-select>
            <vc-textarea
              class="vc-margin-bottom_l"
              :label="
                $t('DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.HTML.LABEL')
              "
            >
            </vc-textarea>
          </vc-form>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  url: "item",
  props: {
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
  },
  setup() {
    const { t } = useI18n();
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

    return {
      contentItem,
      bladeToolbar,
    };
  },
});
</script>

<style lang="less" scoped></style>
