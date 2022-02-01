<template>
  <vc-blade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TITLE')"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-table
      :expanded="expanded"
      :loading="loading"
      :columns="columns"
      :items="contentPublishing"
      :selectedItemId="selectedItemId"
    >
      <!-- Filters -->
      <template v-slot:filters> </template>

      <!-- Not found template -->
      <template v-slot:notfound>
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
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.NOT_FOUND") }}
          </div>
          <vc-button>
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.RESET_SEARCH") }}</vc-button
          >
        </div>
      </template>

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
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.IS_EMPTY") }}
          </div>
          <vc-button>{{
            $t("PROMOTIONS.PAGES.LIST.TABLE.ADD_PROMO")
          }}</vc-button>
        </div>
      </template>

      <!-- Mobile template -->
      <template v-slot:mobile-item="itemData">
        <div
          class="products-list__mobile-item vc-padding_m vc-flex vc-flex-nowrap"
        >
          <div class="vc-flex-grow_1 vc-margin-left_m">
            <div class="vc-font-weight_bold vc-font-size_l">
              {{ itemData.item.name }}
            </div>

            <div
              class="
                vc-margin-top_m
                vc-fill_width
                vc-flex
                vc-flex-justify_space-between
              "
            >
              <div class="vc-ellipsis vc-flex-grow_2">
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.CREATED"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.created).format("L") }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.DESCRIPTION"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.description }}
                </div>
              </div>
            </div>

            <div
              class="
                vc-margin-top_m
                vc-fill_width
                vc-flex
                vc-flex-justify_space-between
              "
            >
              <div class="vc-ellipsis vc-flex-grow_2">
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.PATH"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.path }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.ID"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.id }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useI18n } from "@virtoshell/core";
import { IBladeToolbar, ITableColumns } from "../../../types";
import moment from "moment";

export default defineComponent({
  url: "content-publishing",
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
  setup(props, { emit }) {
    const { t } = useI18n();
    const selectedItemId = ref();
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
    const columns = ref<ITableColumns[]>([
      {
        id: "name",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.NAME"
        ),
        alwaysVisible: true,
        sortable: true,
        width: 343,
      },
      {
        id: "created",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.CREATED"
        ),
        sortable: true,
        alwaysVisible: true,
        width: 100,
        type: "date",
        format: "L",
      },
      {
        id: "description",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.DESCRIPTION"
        ),
        width: 100,
      },
      {
        id: "path",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.PATH"
        ),
        width: 100,
      },
      {
        id: "id",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TABLE.HEADER.ID"
        ),
        width: 100,
        sortable: true,
      },
    ]);
    const contentPublishing = [
      {
        id: "819a8174c9cd4b7d8955",
        name: "Home Page",
        created: Date.now(),
        description: "Index store page",
        path: "ContentItem\\Home Page",
      },
    ];

    const loading = ref(false);
    return {
      title: t("DYNAMIC_CONTENT.PAGES.CONTENT_PUBLISHING.LIST.TITLE"),
      bladeToolbar,
      loading,
      columns,
      contentPublishing,
      selectedItemId,
      moment,
    };
  },
});
</script>

<style lang="less" scoped></style>
