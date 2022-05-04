<template>
  <VcContainer class="dashboard w-full h-full box-border">
    <div class="dashboard-header" v-if="$isDesktop.value">
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>

    <VcRow>
      <VcCol size="10" v-if="$isDesktop.value">
        <VcRow>
          <!-- Latest orders block -->
          <VcCol size="3" class="p-2">
            <VcCard
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('orders-list')">{{
                  $t("SHELL.DASHBOARD.ORDERS.ALL")
                }}</vc-button>
              </template>

              <vc-table
                class="w-full h-full box-border"
                :loading="ordersLoading"
                :items="orders"
                :columns="ordersColumns"
                :header="false"
                :footer="false"
                @itemClick="ordersClick"
              >
                <!-- Empty template -->
                <template v-slot:empty>
                  <div
                    class="w-full h-full box-border flex flex-col items-center justify-center p-5"
                  >
                    <img src="/assets/empty-product.png" />
                    <div class="m-4 text-xl font-medium">
                      {{ $t("SHELL.DASHBOARD.ORDERS.EMPTY") }}
                    </div>
                  </div>
                </template>

                <!-- Override qty column template -->
                <template v-slot:item_items="itemData">
                  {{ calcQty(itemData.item.items) }}
                </template>
              </vc-table>
            </VcCard>
          </VcCol>

          <!-- Latest products block -->
          <VcCol size="4" class="p-2">
            <VcCard
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('products-list')">{{
                  $t("SHELL.DASHBOARD.PRODUCTS.ALL")
                }}</vc-button>
              </template>

              <vc-table
                class="w-full h-full box-border"
                :loading="productsLoading"
                :items="products"
                :columns="productsColumns"
                :header="false"
                :footer="false"
                @itemClick="productsClick"
              >
                <!-- Empty template -->
                <template v-slot:empty>
                  <div
                    class="w-full h-full box-border flex flex-col items-center justify-center p-5"
                  >
                    <img src="/assets/empty-product.png" />
                    <div class="m-4 text-xl font-medium">
                      {{ $t("SHELL.DASHBOARD.PRODUCTS.EMPTY") }}
                    </div>
                    <vc-button @click="open('products-add')">{{
                      $t("SHELL.DASHBOARD.PRODUCTS.ADD")
                    }}</vc-button>
                  </div>
                </template>

                <!-- Override name column template -->
                <template v-slot:item_name="itemData">
                  <div class="flex flex-col">
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <vc-hint
                      class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                    >
                      {{ itemData.item.path }}
                    </vc-hint>
                  </div>
                </template>

                <!-- Override status column template -->
                <template v-slot:item_status="itemData">
                  <mp-product-status
                    :status="itemData.item.status"
                    class="mb-1"
                  />
                </template>
              </vc-table>
            </VcCard>
          </VcCol>
        </VcRow>

        <VcRow>
          <!-- Offers block -->
          <VcCol class="p-2">
            <VcCard
              :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
              icon="fas fa-file-invoice"
            >
              <template v-slot:actions>
                <vc-button small class="mr-3" @click="open('offers-add')">{{
                  $t("SHELL.DASHBOARD.OFFERS.ADD")
                }}</vc-button>
                <vc-button small outline @click="open('offers-list')">{{
                  $t("SHELL.DASHBOARD.OFFERS.ALL")
                }}</vc-button>
              </template>

              <VcRow>
                <VcCol style="display: block">
                  <vc-table
                    class="w-full h-full box-border"
                    :loading="offersLoading"
                    :items="offers"
                    :columns="offersColumns"
                    :header="false"
                    :footer="false"
                    @itemClick="offersClick"
                  >
                    <!-- Empty template -->
                    <template v-slot:empty>
                      <div
                        class="w-full h-full box-border flex flex-col items-center justify-center p-5"
                      >
                        <img src="/assets/empty-product.png" />
                        <div class="m-4 text-xl font-medium">
                          {{ $t("SHELL.DASHBOARD.OFFERS.EMPTY") }}
                        </div>
                        <vc-button @click="open('offers-add')">{{
                          $t("SHELL.DASHBOARD.OFFERS.ADD")
                        }}</vc-button>
                      </div>
                    </template>
                  </vc-table>
                </VcCol>
                <!--                                <VcCol size="0" class="basis-[180px]">-->
                <!--                                  <div class="dashboard-offers__counter">-->
                <!--                                    <div-->
                <!--                                      class="-->
                <!--                                        dashboard-offers__counter-value-->
                <!--                                        dashboard-offers__counter-value_warning-->
                <!--                                      "-->
                <!--                                    >-->
                <!--                                      25-->
                <!--                                    </div>-->
                <!--                                    <div class="dashboard-offers__counter-title">-->
                <!--                                      {{ $t("SHELL.DASHBOARD.OFFERS.ENDING") }}-->
                <!--                                    </div>-->
                <!--                                  </div>-->
                <!--                                  <div class="dashboard-offers__counter">-->
                <!--                                    <div-->
                <!--                                      class="-->
                <!--                                        dashboard-offers__counter-value-->
                <!--                                        dashboard-offers__counter-value_warning-->
                <!--                                      "-->
                <!--                                    >-->
                <!--                                      7-->
                <!--                                    </div>-->
                <!--                                    <div class="dashboard-offers__counter-title">-->
                <!--                                      {{ $t("SHELL.DASHBOARD.OFFERS.LOW_STOCK") }}-->
                <!--                                    </div>-->
                <!--                                  </div>-->
                <!--                                  <div class="dashboard-offers__counter">-->
                <!--                                    <div-->
                <!--                                      class="-->
                <!--                                        dashboard-offers__counter-value-->
                <!--                                        dashboard-offers__counter-value_error-->
                <!--                                      "-->
                <!--                                    >-->
                <!--                                      11-->
                <!--                                    </div>-->
                <!--                                    <div class="dashboard-offers__counter-title">-->
                <!--                                      {{ $t("SHELL.DASHBOARD.OFFERS.OUT_STOCK") }}-->
                <!--                                    </div>-->
                <!--                                  </div>-->
                <!--                                </VcCol>-->
              </VcRow>
            </VcCard>
          </VcCol>
        </VcRow>
      </VcCol>

      <VcCol v-else class="p-2">
        <div class="flex">
          <VcCol class="mr-2">
            <VcCard
              class="mb-4"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
              @click="open('orders-list')"
            >
              <div class="h-px bg-[#e3e7ec]"></div>
              <div class="my-4 dashboard-counters__value">3,334</div>
            </VcCard>
          </VcCol>
          <VcCol class="ml-2">
            <VcCard
              class="mb-4"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
              @click="open('products-list')"
            >
              <div class="h-px bg-[#e3e7ec]"></div>
              <div class="my-4 dashboard-counters__value">49</div>
            </VcCard>
          </VcCol>
        </div>
        <VcCard
          :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
          icon="fas fa-file-invoice"
          @click="open('offers-list')"
        >
          <div class="h-px bg-[#e3e7ec]"></div>
          <div class="my-4 dashboard-counters__value">206</div>
        </VcCard>
      </VcCol>

      <!--       Counters block-->
      <!--            <VcCol class="dashboard-counters p-2">-->
      <!--              <VcCard-->
      <!--                class="mb-4"-->
      <!--                :header="$t('SHELL.DASHBOARD.COUNTERS.REVENUE')"-->
      <!--                icon="fas fa-hand-holding-usd"-->
      <!--              >-->
      <!--                <div class="h-px bg-[#e3e7ec]"></div>-->
      <!--                <div class="my-4 dashboard-counters__value">-->
      <!--                  {{ counters.revenue[range.revenue] }}-->
      <!--                </div>-->
      <!--                <div-->
      <!--                  class="-->
      <!--                    flex-->
      <!--                    justify-center-->
      <!--                    mt-2-->
      <!--                    mb-4-->
      <!--                  "-->
      <!--                >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.revenue !== 'day'"-->
      <!--                    @click="range.revenue = 'day'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.revenue !== 'week'"-->
      <!--                    @click="range.revenue = 'week'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.revenue !== 'month'"-->
      <!--                    @click="range.revenue = 'month'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.revenue !== 'year'"-->
      <!--                    @click="range.revenue = 'year'"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button-->
      <!--                  >-->
      <!--                </div>-->
      <!--              </VcCard>-->

      <!--              <VcCard-->
      <!--                class="mb-4"-->
      <!--                :header="$t('SHELL.DASHBOARD.COUNTERS.PURCHASED')"-->
      <!--                icon="fas fa-boxes"-->
      <!--              >-->
      <!--                <div class="h-px bg-[#e3e7ec]"></div>-->
      <!--                <div class="my-4 dashboard-counters__value">-->
      <!--                  {{ counters.purchased[range.purchased] }}-->
      <!--                </div>-->
      <!--                <div-->
      <!--                  class="-->
      <!--                    flex-->
      <!--                    justify-center-->
      <!--                    mt-2-->
      <!--                    mb-4-->
      <!--                  "-->
      <!--                >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.purchased !== 'day'"-->
      <!--                    @click="range.purchased = 'day'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.purchased !== 'week'"-->
      <!--                    @click="range.purchased = 'week'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.purchased !== 'month'"-->
      <!--                    @click="range.purchased = 'month'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.purchased !== 'year'"-->
      <!--                    @click="range.purchased = 'year'"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button-->
      <!--                  >-->
      <!--                </div>-->
      <!--              </VcCard>-->

      <!--              <VcCard-->
      <!--                class="mb-4"-->
      <!--                :header="$t('SHELL.DASHBOARD.COUNTERS.AVERAGE_ORDER')"-->
      <!--                icon="fas fa-dollar-sign"-->
      <!--              >-->
      <!--                <div class="h-px bg-[#e3e7ec]"></div>-->
      <!--                <div class="my-4 dashboard-counters__value">-->
      <!--                  {{ counters.orderAvg[range.orderAvg] }}-->
      <!--                </div>-->
      <!--                <div-->
      <!--                  class="-->
      <!--                    flex-->
      <!--                    justify-center-->
      <!--                    mt-2-->
      <!--                    mb-4-->
      <!--                  "-->
      <!--                >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.orderAvg !== 'day'"-->
      <!--                    @click="range.orderAvg = 'day'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.orderAvg !== 'week'"-->
      <!--                    @click="range.orderAvg = 'week'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.orderAvg !== 'month'"-->
      <!--                    @click="range.orderAvg = 'month'"-->
      <!--                    class="mr-2"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button-->
      <!--                  >-->
      <!--                  <vc-button-->
      <!--                    small-->
      <!--                    :outline="range.orderAvg !== 'year'"-->
      <!--                    @click="range.orderAvg = 'year'"-->
      <!--                    >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button-->
      <!--                  >-->
      <!--                </div>-->
      <!--              </VcCard>-->

      <!--              <VcCard-->
      <!--                :header="$t('SHELL.DASHBOARD.REVIEWS.TITLE')"-->
      <!--                icon="fas fa-comment-dots"-->
      <!--              >-->
      <!--                <div class="h-px bg-[#e3e7ec]"></div>-->
      <!--                <div class="p-4">-->
      <!--                  <vc-hint>22.02.2021</vc-hint>-->
      <!--                  <div class="dashboard-review-header">Piers Stephenson</div>-->
      <!--                  <div>-->
      <!--                    My neighbor Victoria has one of these. She works as a professor-->
      <!--                    and she says it looks menthol. I saw one of these in Bhutan and I-->
      <!--                    bought one. My jaguar loves to play with it. I use it daily when-->
      <!--                    i'm in my outhouse. Heard about this on compas radio, decided to-->
      <!--                    give it a try. Heard about this on instrumental country radio,-->
      <!--                    decided to give it a try. My tyrannosaurus rex loves to play with-->
      <!--                    it. Talk about... remorse!!!-->
      <!--                  </div>-->
      <!--                  <div class="flex justify-center mt-4">-->
      <!--                    <vc-button small outline>{{-->
      <!--                      $t("SHELL.DASHBOARD.REVIEWS.MORE")-->
      <!--                    }}</vc-button>-->
      <!--                  </div>-->
      <!--                </div>-->
      <!--              </VcCard>-->
      <!--            </VcCol>-->
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { useI18n } from "@virtoshell/core";
import { computed, onMounted, reactive, ref } from "vue";
import { OffersDetails, OffersList, useOffers } from "../modules/offers";
import { OrdersEdit, OrdersList, useOrders } from "../modules/orders";
import {
  ProductsEdit,
  ProductsList,
  useProducts,
  MpProductStatus,
} from "../modules/products";
import { OrderLineItem } from "@virtoshell/api-client";
import { ITableColumns } from "../types";
import { useRouter } from "vue-router";

/*
interface ITermDefinition {
  day: string;
  week: string;
  month: string;
  year: string;
}

interface ICounters {
  revenue: ITermDefinition;
  purchased: ITermDefinition;
  orderAvg: ITermDefinition;
}
 */

const props = defineProps({
  openPage: {
    type: Function,
    default: undefined,
  },
});
const { t } = useI18n();
const { products, loadProducts, loading: productsLoading } = useProducts();
const { orders, loadOrders, loading: ordersLoading } = useOrders();
const { offers, loadOffers, loading: offersLoading } = useOffers();
const router = useRouter();

const productsColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    width: 60,
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    width: 120,
  },
  {
    id: "createdDate",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    type: "date-ago",
  },
  {
    id: "status",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 180,
  },
]);

const ordersColumns = ref<ITableColumns[]>([
  {
    id: "number",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
    width: 80,
  },
  {
    id: "items",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.QTY")),
    width: 80,
  },
  {
    id: "status",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 160,
    type: "status",
  },
  {
    id: "createdDate",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED")),
    width: 160,
    type: "date-ago",
  },
]);

const offersColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    width: 60,
    type: "image",
  },
  {
    id: "name",
    field: "name",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    width: 120,
  },
  {
    id: "createdDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    type: "date-ago",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU")),
    width: 120,
  },
  {
    id: "salePrice",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SALE_PRICE")),
    width: 100,
    type: "money",
  },
  {
    id: "listPrice",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.LIST_PRICE")),
    width: 100,
    type: "money",
  },
  {
    id: "minQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY")),
    width: 80,
    type: "number",
  },
  {
    id: "inStockQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY")),
    width: 80,
    type: "number",
  },
]);

// const counters = reactive<ICounters>({
//   revenue: {
//     day: "1,230.09",
//     week: "13,445.75",
//     month: "490,314.81",
//     year: "3,553,165.94",
//   },
//   purchased: {
//     day: "17",
//     week: "993",
//     month: "31,230",
//     year: "1,151,202",
//   },
//   orderAvg: {
//     day: "515.04",
//     week: "792.45",
//     month: "620.01",
//     year: "593.10",
//   },
// });
//
// const range = reactive({
//   revenue: "day",
//   purchased: "day",
//   orderAvg: "day",
// });

onMounted(async () => {
  router.push("/");
  loadOrders({ take: 5 });
  loadProducts({ take: 5 });
  loadOffers({ take: 5 });
});

function open(key: string): void {
  switch (key) {
    case "orders-list":
      props.openPage(0, {
        component: OrdersList,
      });
      break;
    case "products-list":
      props.openPage(0, {
        component: ProductsList,
      });
      break;
    case "products-add":
      props.openPage(0, {
        component: ProductsList,
      });
      props.openPage(1, {
        component: ProductsEdit,
      });
      break;
    case "offers-list":
      props.openPage(0, {
        component: OffersList,
      });
      break;
    case "offers-add":
      props.openPage(0, {
        component: OffersList,
      });
      props.openPage(1, {
        component: OffersDetails,
      });
      break;
  }
}

function ordersClick(item: { id: string }): void {
  props.openPage(0, {
    component: OrdersList,
    param: item.id,
  });
  props.openPage(1, {
    component: OrdersEdit,
    param: item.id,
  });
}

function productsClick(item: { id: string }): void {
  props.openPage(0, {
    component: ProductsList,
    param: item.id,
  });
  props.openPage(1, {
    component: ProductsEdit,
    param: item.id,
  });
}

function offersClick(item: { id: string }): void {
  props.openPage(0, {
    component: OffersList,
    param: item.id,
  });
  props.openPage(1, {
    component: OffersDetails,
    param: item.id,
  });
}

function calcQty(items: OrderLineItem[]) {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}
</script>

<style lang="scss">
.dashboard {
  --card-header-background: transparent;

  &-header {
    @apply text-[25px] text-[#333333] my-3 px-2;
  }

  &-counters {
    @apply grow-0 basis-[280px] #{!important};

    .vc-app_mobile & {
      @apply grow basis-0 #{!important};
    }

    &__title {
      @apply text-[14px] font-medium text-[#a9bfd2]
        text-center mt-2;
    }

    &__value {
      @apply text-[26px] font-medium text-[#319ed4] text-center;
    }
  }

  &-review-header {
    @apply text-[#319ed4] font-medium text-lg my-1;
  }

  &-offers {
    &__counter {
      @apply grow text-center flex flex-col items-center
        justify-center border-l border-solid border-l-[#e5e5e5]
        p-5 border-b border-solid border-b-[#e5e5e5] last:border-b-0
        first:border-t first:border-solid first:border-t-[#e5e5e5];

      &-value {
        @apply text-[32px] font-medium mb-2;

        &_error {
          @apply text-[#ff4a4a];
        }

        &_warning {
          @apply text-[#f89406];
        }
      }

      &-title {
        @apply font-bold text-[#6b7987];
      }
    }
  }
}

.vc-separator {
  @apply h-px bg-[#e3e7ec];
}
</style>
