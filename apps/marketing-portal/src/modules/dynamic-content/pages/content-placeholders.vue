<template>
  <vc-blade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <vc-table>
      <!-- Filters -->
      <template v-slot:filters></template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS.LIST.EMPTY") }}
          </div>
          <vc-button>{{
            $t(
              "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS.LIST.ADD_PLACEHOLDER"
            )
          }}</vc-button>
        </div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { IBladeToolbar } from "../../../types";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  url: "content-placeholders",
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: false,
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
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "refresh",
        title: t("PROMOTIONS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        clickHandler() {
          alert("reload");
        },
      },
      {
        id: "add",
        title: t("PROMOTIONS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        clickHandler() {
          alert("add");
        },
      },
    ]);

    return {
      title: t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS.TITLE"),
      bladeToolbar,
    };
  },
});
</script>

<style lang="less" scoped></style>
