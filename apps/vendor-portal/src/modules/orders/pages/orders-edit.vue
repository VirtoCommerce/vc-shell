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
        <VcCol size="1" class="p-2">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.ORDER_INFO.TITLE')">
            <VcRow class="p-2">
              <VcCol class="p-2">
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
                  class="border-t border-solid border-t-[#e5e5e5] mt-[5px] pt-[21px]"
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
                  :label="$t('ORDERS.PAGES.EDIT.ORDER_INFO.COMMISSIONS_TOTAL')"
                  :value="
                    order.feeTotal &&
                    order.feeTotal.toFixed(2) + ' ' + order.currency
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
        <VcCol size="1" class="p-2">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.BUYER_RECIPIENT.TITLE')">
            <VcCol class="p-2">
              <VcCol
                class="p-2"
                v-for="(item, i) in shippingInfo"
                :key="`${item.label}_${i}`"
              >
                <VcInfoRow
                  :label="item.label"
                  :value="item.name"
                  :class="{
                    'border-t border-solid border-t-[#e5e5e5] mt-[5px] pt-[21px]':
                      i === 1,
                  }"
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
        <VcCol class="p-2">
          <VcCard :header="$t('ORDERS.PAGES.EDIT.ITEMS_LIST.TITLE')">
            <VcTable
              :multiselect="false"
              :columns="columns"
              :items="items"
              :header="false"
              :footer="false"
            >
              <template v-slot:item_name="itemData">
                <div class="flex flex-col">
                  <div>{{ itemData.item.name }}</div>
                  <VcHint class="mt-1"
                    >{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.SKU") }}:
                    {{ itemData.item.sku }}</VcHint
                  >
                </div>
              </template>
              <template v-slot:item_quantity="itemData">
                <div class="flex flex-col">
                  <div>{{ itemData.item.quantity }}</div>
                </div>
              </template>

              <template v-slot:item_fee="itemData">
                <div
                  class="flex flex-col"
                  v-if="itemData.item.feeDetails.length"
                >
                  <div>{{ itemData.item.feeDetails[0].description }}</div>
                  <div>
                    <span>{{
                      Math.trunc(Number(itemData.item.feeDetails[0].amount))
                    }}</span
                    ><span class="text-[#a5a5a5] text-xs"
                      >.{{
                        `${
                          (Number(itemData.item.feeDetails[0].amount) * 100) %
                          100
                        }`
                          .padEnd(2, "0")
                          .slice(0, 2)
                      }}</span
                    >
                  </div>
                </div>
              </template>

              <template v-slot:mobile-item="itemData">
                <div class="py-3 px-4">
                  <div class="w-full flex justify-evenly">
                    <VcImage
                      class="shrink-0"
                      aspect="1x1"
                      size="s"
                      :bordered="true"
                      :src="itemData.item.imageUrl"
                    ></VcImage>
                    <div class="grow basis-0 ml-3">
                      <div class="font-bold text-lg">
                        {{ itemData.item.name }}
                      </div>
                      <VcHint class="mt-1">
                        {{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.SKU") }}:
                        {{ itemData.item.sku }}
                      </VcHint>
                    </div>
                  </div>
                  <div class="mt-3 w-full flex justify-between">
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
                    >
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.QUANTITY")
                      }}</VcHint>
                      <div
                        class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                      >
                        {{ itemData.item.quantity }}
                      </div>
                    </div>
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
                    >
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.UNIT_PRICE")
                      }}</VcHint>
                      <div
                        class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                      >
                        {{
                          itemData.item.price && itemData.item.price.toFixed(2)
                        }}
                      </div>
                    </div>
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
                    >
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.TOTAL")
                      }}</VcHint>
                      <div
                        class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                      >
                        {{
                          itemData.item.extendedPrice &&
                          itemData.item.extendedPrice.toFixed(2)
                        }}
                      </div>
                    </div>
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
                      v-if="itemData.item.feeDetails.length"
                    >
                      <VcHint>{{
                        $t("ORDERS.PAGES.EDIT.ITEMS_LIST.COMMISSION")
                      }}</VcHint>

                      <div
                        class="mt-1 text-ellipsis overflow-hidden whitespace-nowrap"
                      >
                        <div
                          class="text-ellipsis overflow-hidden whitespace-nowrap"
                        >
                          {{ itemData.item.feeDetails[0].description }}
                          <br /><span
                            class="text-ellipsis overflow-hidden whitespace-nowrap"
                          >
                            {{
                              itemData.item.feeDetails[0].amount &&
                              itemData.item.feeDetails[0].amount.toFixed(2)
                            }}
                          </span>
                        </div>
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
          (order.value.status === "Paid" ||
            order.value.status === "Unpaid" ||
            order.value.status === "New") &&
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
    class: "pr-0",
    type: "image",
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "quantity",
    title: "Quantity",
    width: 100,
    type: "number",
  },
  {
    id: "price",
    title: "Unit price",
    width: 100,
    type: "money",
  },
  {
    id: "extendedPrice",
    title: "Total",
    width: 100,
    type: "money",
  },
  {
    id: "fee",
    title: "Commission",
  },
];
</script>
