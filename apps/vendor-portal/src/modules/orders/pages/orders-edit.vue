<template>
  <VcBlade
    v-loading="loading"
    :title="order.number"
    :expanded="expanded"
    :closable="closable"
    width="70%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <VcContainer>
      <VcRow>
        <VcCol size="1" class="vc-padding_s">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.ORDER_INFO.TITLE')">
            <VcRow class="vc-padding_s">
              <VcCol class="vc-padding_s">
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.ORDER_REF')"
                  :value="order.number"
                />
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.CREATED_DATE')"
                  :value="createdDate"
                />
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.STORE')"
                  :value="order.storeId"
                  :tooltip="$t('ORDERS.PAGES.EDIT.ORDER_INFO.STORE_TOOLTIP')"
                />
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.ORDER_STATUS')"
                  :value="order.status"
                />
                <VcInfoRow
                  class="orders-edit__row_line"
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.SUBTOTAL')"
                  :value="
                    order.subTotal &&
                    order.subTotal.toFixed(2) + ' ' + order.currency
                  "
                />
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.DISCOUNT_TOTAL')"
                  :value="
                    order.discountTotal &&
                    order.discountTotal.toFixed(2) + ' ' + order.currency
                  "
                />
                <VcInfoRow
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.TOTAL')"
                  :value="
                    order.total && order.total.toFixed(2) + ' ' + order.currency
                  "
                />
              </VcCol>
            </VcRow>
          </VcCard>
        </VcCol>
        <VcCol size="1" class="vc-padding_s">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.BUYER_RECIPIENT.TITLE')">
            <VcCol class="vc-padding_s">
              <VcCol
                class="vc-padding_s"
                v-for="(item, i) in shippingInfo"
                :key="`${item.label}_${i}`"
              >
                <VcInfoRow
                  :label="item.label"
                  :value="item.name"
                  :class="{ 'orders-edit__row_line': i === 1 }"
                />
                <VcInfoRow :value="item.address" v-if="item.address" />
                <VcInfoRow :value="item.phone" v-if="item.phone" />
                <VcInfoRow :value="item.email" type="email" v-if="item.email" />
              </VcCol>
            </VcCol>
          </VcCard>
        </VcCol>
      </VcRow>

      <VcRow>
        <VcCol class="vc-padding_s">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.ITEMS_LIST.TITLE')">
            <VcTable
              :multiselect="false"
              :columns="columns"
              :items="items"
              :header="false"
              :footer="false"
            >
              <template v-slot:item_name="itemData">
                <div class="vc-flex vc-flex-column">
                  <div>{{ itemData.item.name }}</div>
                  <VcHint class="vc-margin-top_xs"
                    >{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.SKU") }}:
                    {{ itemData.item.sku }}</VcHint
                  >
                </div>
              </template>

              <template v-slot:mobile-item="itemData">
                <div class="vc-padding-vertical_m vc-padding-horizontal_l">
                  <div class="vc-fill_width vc-flex vc-flex-justify_evenly">
                    <VcImage
                      class="vc-flex-shrink_0"
                      aspect="1x1"
                      size="s"
                      :bordered="true"
                      :src="itemData.item.imageUrl"
                    ></VcImage>
                    <div class="vc-flex-grow_1 vc-margin-left_m">
                      <div class="vc-font-weight_bold vc-font-size_l">
                        {{ itemData.item.name }}
                      </div>
                      <VcHint class="vc-margin-top_xs">
                        {{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.SKU") }}:
                        {{ itemData.item.sku }}
                      </VcHint>
                    </div>
                  </div>
                  <div
                    class="vc-margin-top_m vc-fill_width vc-flex vc-flex-justify_space-between"
                  >
                    <div class="vc-ellipsis vc-flex-grow_2">
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.QUANTITY")
                      }}</VcHint>
                      <div class="vc-ellipsis vc-margin-top_xs">
                        {{ itemData.item.quantity }}
                      </div>
                    </div>
                    <div class="vc-ellipsis vc-flex-grow_2">
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.UNIT_PRICE")
                      }}</VcHint>
                      <div class="vc-ellipsis vc-margin-top_xs">
                        {{
                          itemData.item.price && itemData.item.price.toFixed(2)
                        }}
                      </div>
                    </div>
                    <div class="vc-ellipsis vc-flex-grow_1">
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.TOTAL")
                      }}</VcHint>
                      <div class="vc-ellipsis vc-margin-top_xs">
                        {{
                          itemData.item.extendedPrice &&
                          itemData.item.extendedPrice.toFixed(2)
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </VcTable>
          </VcCard>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from "vue";

export default defineComponent({
  url: "order",
});
</script>

<script lang="ts" setup>
import moment from "moment";

import { useOrder } from "../composables";
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n } from "@virtoshell/core";

const props = defineProps({
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

const emit = defineEmits(["parent:call"]);
const { t } = useI18n();
const { loading, order, changeOrderStatus, loadOrder, loadPdf, shippingInfo } =
  useOrder();
const locale = window.navigator.language;
const items = computed(() => order.value?.items);
const createdDate = computed(() => {
  const date = new Date(order.value?.createdDate);
  return moment(date).locale(locale).format("L LT");
});

onMounted(async () => {
  if (props.param) {
    await loadOrder({ id: props.param });
  }
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    title: computed(() => t("ORDERS.PAGES.EDIT.ACTIONS.DL_PDF")),
    icon: "fas fa-file-pdf",
    async clickHandler() {
      if (props.param) {
        await loadPdf();
      }
    },
    disabled: !props.param,
  },
  {
    title: computed(() => t("ORDERS.PAGES.EDIT.ACTIONS.ACCEPT_ORDER")),
    icon: "far fa-check-circle",
    async clickHandler() {
      if (
        props.param &&
        (order.value.status === "Paid" ||
          order.value.status === "Unpaid" ||
          order.value.status === "New")
      ) {
        const lastStatus = order.value.status;

        try {
          order.value.status = "Accepted";
          await changeOrderStatus(order.value);
          emit("parent:call", {
            method: "reload",
          });
        } catch (e) {
          order.value.status = lastStatus;
        }
      }
    },
    disabled: computed(
      () =>
        !(
          (order.value.status === "Paid" || order.value.status === "Unpaid") &&
          props.param
        )
    ),
  },
  {
    title: computed(() => t("ORDERS.PAGES.EDIT.ACTIONS.CANCEL")),
    icon: "fas fa-times-circle",
    async clickHandler() {
      if (props.param) {
        const lastStatus = order.value.status;

        try {
          order.value.status = "Cancelled";
          await changeOrderStatus(order.value);
          emit("parent:call", {
            method: "reload",
          });
        } catch (e) {
          order.value.status = lastStatus;
        }
      }
    },
    disabled: computed(
      () => !!(order.value.status === "Cancelled" && props.param)
    ),
  },
  {
    title: computed(() => t("ORDERS.PAGES.EDIT.ACTIONS.SHIP")),
    icon: "fas fa-shipping-fast",
    async clickHandler() {
      if (order.value.status === "Accepted" && props.param) {
        const lastStatus = order.value.status;

        try {
          order.value.status = "Shipped";
          await changeOrderStatus(order.value);
          emit("parent:call", {
            method: "reload",
          });
        } catch (e) {
          order.value.status = lastStatus;
        }
      }
    },
    disabled: computed(
      () => !(order.value.status === "Accepted" && props.param)
    ),
  },
]);

const columns: ITableColumns[] = [
  {
    id: "imageUrl",
    title: "Pic",
    width: 60,
    class: "vc-padding-right_none",
    type: "image",
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "quantity",
    title: "Quantity",
    width: 120,
    type: "number",
  },
  {
    id: "price",
    title: "Unit price",
    width: 120,
    type: "money",
  },
  {
    id: "extendedPrice",
    title: "Total",
    width: 120,
    type: "money",
  },
];
</script>

<style lang="less">
.orders-edit {
  &__row {
    &_line {
      border-top: 1px solid #e5e5e5;
      margin-top: 5px;
      padding-top: 21px;
    }
  }
}
.orders-totals {
  background: #fbfdfe;
  box-shadow: inset 0px 4px 7px rgba(199, 213, 227, 0.3);

  &__counter {
    color: #83a6c3;
  }
}
</style>
