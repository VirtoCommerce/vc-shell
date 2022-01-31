<template>
  <vc-blade
    :title="$t('PROMOTIONS.PAGES.LIST.TITLE')"
    width="50%"
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
      :items="promotionsList"
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
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.START_DATE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.startDate).format("L") }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.MODIFIED")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.modified).format("L") }}
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
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_ACTIVE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  <vc-status-icon
                    :status="itemData.item.isActive"
                  ></vc-status-icon>
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_EXCLUSIVE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  <vc-status-icon
                    :status="itemData.item.isExclusive"
                  ></vc-status-icon>
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.createdDate).format("L") }}
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
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";
import moment from "moment";

export default defineComponent({
  url: "promotions",
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
    const columns = ref<ITableColumns[]>([
      {
        id: "name",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
        width: 343,
      },
      {
        id: "startDate",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.START_DATE"),
        sortable: true,
        alwaysVisible: true,
        width: 80,
        type: "date",
        format: "L",
      },
      {
        id: "isActive",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_ACTIVE"),
        width: 80,
        sortable: true,
        type: "status-icon",
      },
      {
        id: "isExclusive",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_EXCLUSIVE"),
        width: 80,
        type: "status-icon",
      },
      {
        id: "modified",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.MODIFIED"),
        width: 80,
        sortable: true,
        type: "date",
        format: "L",
      },
      {
        id: "createdDate",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 100,
        alwaysVisible: true,
        type: "date",
        format: "L",
      },
    ]);
    const promotionsList = [
      {
        id: "1",
        name: "test",
        startDate: Date.now(),
        isActive: true,
        isExclusive: false,
        modified: Date.now(),
        createdDate: Date.now(),
      },
    ];
    const loading = ref(false);
    return {
      title: t("PROMOTIONS.PAGES.LIST.TITLE"),
      bladeToolbar,
      loading,
      columns,
      promotionsList,
      moment,
    };
  },
});
</script>

<style lang="less" scoped></style>
