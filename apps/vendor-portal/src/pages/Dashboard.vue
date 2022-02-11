<template>
  <vc-container class="dashboard vc-fill_all">
    <div
      class="dashboard-header vc-margin-vertical_m vc-padding-horizontal_s"
      v-if="$isDesktop.value"
    >
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>

    <vc-row>
      <vc-col size="10" v-if="$isDesktop.value">
        <vc-row>
          <!-- Latest orders block -->
          <vc-col size="3" class="vc-padding_s">
            <vc-card
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('orders-list')">{{
                  $t("SHELL.DASHBOARD.ORDERS.ALL")
                }}</vc-button>
              </template>

              <vc-table
                class="vc-fill_all"
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
                    class="
                      vc-fill_all
                      vc-flex vc-flex-column
                      vc-flex-align_center
                      vc-flex-justify_center
                      vc-padding_xl
                    "
                  >
                    <img src="/assets/empty-product.png" />
                    <div
                      class="vc-margin_l vc-font-size_xl vc-font-weight_medium"
                    >
                      {{ $t("SHELL.DASHBOARD.ORDERS.EMPTY") }}
                    </div>
                  </div>
                </template>

                <!-- Override qty column template -->
                <template v-slot:item_items="itemData">
                  {{ calcQty(itemData.item.items) }}
                </template>
              </vc-table>
            </vc-card>
          </vc-col>

          <!-- Latest products block -->
          <vc-col size="4" class="vc-padding_s">
            <vc-card
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('products-list')">{{
                  $t("SHELL.DASHBOARD.PRODUCTS.ALL")
                }}</vc-button>
              </template>

              <vc-table
                class="vc-fill_all"
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
                    class="
                      vc-fill_all
                      vc-flex vc-flex-column
                      vc-flex-align_center
                      vc-flex-justify_center
                      vc-padding_xl
                    "
                  >
                    <img src="/assets/empty-product.png" />
                    <div
                      class="vc-margin_l vc-font-size_xl vc-font-weight_medium"
                    >
                      {{ $t("SHELL.DASHBOARD.PRODUCTS.EMPTY") }}
                    </div>
                    <vc-button @click="open('products-add')">{{
                      $t("SHELL.DASHBOARD.PRODUCTS.ADD")
                    }}</vc-button>
                  </div>
                </template>

                <!-- Override name column template -->
                <template v-slot:item_name="itemData">
                  <div class="vc-flex vc-flex-column">
                    <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                    <vc-hint class="vc-ellipsis vc-margin-top_xs">
                      {{ itemData.item.path }}
                    </vc-hint>
                  </div>
                </template>

                <!-- Override status column template -->
                <template v-slot:item_status="itemData">
                  <mp-product-status
                    :status="itemData.item.status"
                    class="vc-margin-bottom_xs"
                  />
                </template>
              </vc-table>
            </vc-card>
          </vc-col>
        </vc-row>

        <vc-row>
          <!-- Offers block -->
          <vc-col class="vc-padding_s">
            <vc-card
              :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
              icon="fas fa-file-invoice"
            >
              <template v-slot:actions>
                <vc-button
                  small
                  class="vc-margin-right_m"
                  @click="open('offers-add')"
                  >{{ $t("SHELL.DASHBOARD.OFFERS.ADD") }}</vc-button
                >
                <vc-button small outline @click="open('offers-list')">{{
                  $t("SHELL.DASHBOARD.OFFERS.ALL")
                }}</vc-button>
              </template>

              <vc-row>
                <vc-col style="display: block">
                  <vc-table
                    class="vc-fill_all"
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
                        class="
                          vc-fill_all
                          vc-flex vc-flex-column
                          vc-flex-align_center
                          vc-flex-justify_center
                          vc-padding_xl
                        "
                      >
                        <img src="/assets/empty-product.png" />
                        <div
                          class="
                            vc-margin_l
                            vc-font-size_xl
                            vc-font-weight_medium
                          "
                        >
                          {{ $t("SHELL.DASHBOARD.OFFERS.EMPTY") }}
                        </div>
                        <vc-button @click="open('offers-add')">{{
                          $t("SHELL.DASHBOARD.OFFERS.ADD")
                        }}</vc-button>
                      </div>
                    </template>
                  </vc-table>
                </vc-col>
                <vc-col size="0" style="flex-basis: 180px">
                  <div class="dashboard-offers__counter">
                    <div
                      class="
                        dashboard-offers__counter-value
                        dashboard-offers__counter-value_warning
                      "
                    >
                      25
                    </div>
                    <div class="dashboard-offers__counter-title">
                      {{ $t("SHELL.DASHBOARD.OFFERS.ENDING") }}
                    </div>
                  </div>
                  <div class="dashboard-offers__counter">
                    <div
                      class="
                        dashboard-offers__counter-value
                        dashboard-offers__counter-value_warning
                      "
                    >
                      7
                    </div>
                    <div class="dashboard-offers__counter-title">
                      {{ $t("SHELL.DASHBOARD.OFFERS.LOW_STOCK") }}
                    </div>
                  </div>
                  <div class="dashboard-offers__counter">
                    <div
                      class="
                        dashboard-offers__counter-value
                        dashboard-offers__counter-value_error
                      "
                    >
                      11
                    </div>
                    <div class="dashboard-offers__counter-title">
                      {{ $t("SHELL.DASHBOARD.OFFERS.OUT_STOCK") }}
                    </div>
                  </div>
                </vc-col>
              </vc-row>
            </vc-card>
          </vc-col>
        </vc-row>
      </vc-col>

      <vc-col v-else class="vc-padding_s">
        <div class="vc-flex">
          <vc-col class="vc-margin-right_s">
            <vc-card
              class="vc-margin-bottom_l"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
              @click="open('orders-list')"
            >
              <div class="vc-separator"></div>
              <div class="vc-margin-vertical_l dashboard-counters__value">
                3,334
              </div>
            </vc-card>
          </vc-col>
          <vc-col class="vc-margin-left_s">
            <vc-card
              class="vc-margin-bottom_l"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
              @click="open('products-list')"
            >
              <div class="vc-separator"></div>
              <div class="vc-margin-vertical_l dashboard-counters__value">
                49
              </div>
            </vc-card>
          </vc-col>
        </div>
        <vc-card
          :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
          icon="fas fa-file-invoice"
          @click="open('offers-list')"
        >
          <div class="vc-separator"></div>
          <div class="vc-margin-vertical_l dashboard-counters__value">206</div>
        </vc-card>
      </vc-col>

      <!-- Counters block -->
      <vc-col class="dashboard-counters vc-padding_s">
        <vc-card
          class="vc-margin-bottom_l"
          :header="$t('SHELL.DASHBOARD.COUNTERS.REVENUE')"
          icon="fas fa-hand-holding-usd"
        >
          <div class="vc-separator"></div>
          <div class="vc-margin-vertical_l dashboard-counters__value">
            {{ counters.revenue[range.revenue] }}
          </div>
          <div
            class="
              vc-flex
              vc-flex-justify_center
              vc-margin-top_s
              vc-margin-bottom_l
            "
          >
            <vc-button
              small
              :outline="range.revenue !== 'day'"
              @click="range.revenue = 'day'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button
            >
            <vc-button
              small
              :outline="range.revenue !== 'week'"
              @click="range.revenue = 'week'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button
            >
            <vc-button
              small
              :outline="range.revenue !== 'month'"
              @click="range.revenue = 'month'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button
            >
            <vc-button
              small
              :outline="range.revenue !== 'year'"
              @click="range.revenue = 'year'"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button
            >
          </div>
        </vc-card>

        <vc-card
          class="vc-margin-bottom_l"
          :header="$t('SHELL.DASHBOARD.COUNTERS.PURCHASED')"
          icon="fas fa-boxes"
        >
          <div class="vc-separator"></div>
          <div class="vc-margin-vertical_l dashboard-counters__value">
            {{ counters.purchased[range.purchased] }}
          </div>
          <div
            class="
              vc-flex
              vc-flex-justify_center
              vc-margin-top_s
              vc-margin-bottom_l
            "
          >
            <vc-button
              small
              :outline="range.purchased !== 'day'"
              @click="range.purchased = 'day'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button
            >
            <vc-button
              small
              :outline="range.purchased !== 'week'"
              @click="range.purchased = 'week'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button
            >
            <vc-button
              small
              :outline="range.purchased !== 'month'"
              @click="range.purchased = 'month'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button
            >
            <vc-button
              small
              :outline="range.purchased !== 'year'"
              @click="range.purchased = 'year'"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button
            >
          </div>
        </vc-card>

        <vc-card
          class="vc-margin-bottom_l"
          :header="$t('SHELL.DASHBOARD.COUNTERS.AVERAGE_ORDER')"
          icon="fas fa-dollar-sign"
        >
          <div class="vc-separator"></div>
          <div class="vc-margin-vertical_l dashboard-counters__value">
            {{ counters.orderAvg[range.orderAvg] }}
          </div>
          <div
            class="
              vc-flex
              vc-flex-justify_center
              vc-margin-top_s
              vc-margin-bottom_l
            "
          >
            <vc-button
              small
              :outline="range.orderAvg !== 'day'"
              @click="range.orderAvg = 'day'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.DAY") }}</vc-button
            >
            <vc-button
              small
              :outline="range.orderAvg !== 'week'"
              @click="range.orderAvg = 'week'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.WEEK") }}</vc-button
            >
            <vc-button
              small
              :outline="range.orderAvg !== 'month'"
              @click="range.orderAvg = 'month'"
              class="vc-margin-right_s"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.MONTH") }}</vc-button
            >
            <vc-button
              small
              :outline="range.orderAvg !== 'year'"
              @click="range.orderAvg = 'year'"
              >{{ $t("SHELL.DASHBOARD.COUNTERS.YEAR") }}</vc-button
            >
          </div>
        </vc-card>

        <vc-card
          :header="$t('SHELL.DASHBOARD.REVIEWS.TITLE')"
          icon="fas fa-comment-dots"
        >
          <div class="vc-separator"></div>
          <div class="vc-padding_m">
            <vc-hint>22.02.2021</vc-hint>
            <div class="dashboard-review-header">Piers Stephenson</div>
            <div>
              My neighbor Victoria has one of these. She works as a professor
              and she says it looks menthol. I saw one of these in Bhutan and I
              bought one. My jaguar loves to play with it. I use it daily when
              i'm in my outhouse. Heard about this on compas radio, decided to
              give it a try. Heard about this on instrumental country radio,
              decided to give it a try. My tyrannosaurus rex loves to play with
              it. Talk about... remorse!!!
            </div>
            <div class="vc-flex vc-flex-justify_center vc-margin-top_m">
              <vc-button small outline>{{
                $t("SHELL.DASHBOARD.REVIEWS.MORE")
              }}</vc-button>
            </div>
          </div>
        </vc-card>
      </vc-col>
    </vc-row>
  </vc-container>
</template>

<script lang="ts">
import { useI18n } from "@virtoshell/core";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { OffersDetails, OffersList, useOffers } from "../modules/offers";
import { OrdersEdit, OrdersList, useOrders } from "../modules/orders";
import {
  ProductsEdit,
  ProductsList,
  useProducts,
  MpProductStatus,
} from "../modules/products";
import moment from "moment";
import { OrderLineItem } from "@virtoshell/api-client";
import { ITableColumns } from "../types";

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

export default defineComponent({
  props: {
    openPage: {
      type: Function,
      default: undefined,
    },
  },

  components: {
    MpProductStatus,
  },

  setup(props) {
    const { t } = useI18n();
    const { products, loadProducts, loading: productsLoading } = useProducts();
    const { orders, loadOrders, loading: ordersLoading } = useOrders();
    const { offers, loadOffers, loading: offersLoading } = useOffers();

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
      },
      {
        id: "createdDate",
        title: computed(() =>
          t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")
        ),
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
        title: computed(() =>
          t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")
        ),
        width: 60,
        type: "image",
      },
      {
        id: "name",
        field: "name",
        title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
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

    const counters = reactive<ICounters>({
      revenue: {
        day: "1,230.09",
        week: "13,445.75",
        month: "490,314.81",
        year: "3,553,165.94",
      },
      purchased: {
        day: "17",
        week: "993",
        month: "31,230",
        year: "1,151,202",
      },
      orderAvg: {
        day: "515.04",
        week: "792.45",
        month: "620.01",
        year: "593.10",
      },
    });

    const range = reactive({
      revenue: "day",
      purchased: "day",
      orderAvg: "day",
    });

    onMounted(async () => {
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

    return {
      moment,
      open,
      products,
      productsLoading,
      productsColumns,
      productsClick,
      orders,
      ordersLoading,
      ordersColumns,
      ordersClick,
      offers,
      offersLoading,
      offersColumns,
      offersClick,

      calcQty(items: OrderLineItem[]) {
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },

      counters,
      range,
    };
  },
});
</script>

<style lang="less">
.dashboard {
  --card-header-background: transparent;

  &-header {
    font-size: 25px;
    color: #333333;
  }

  &-counters {
    flex-grow: 0 !important;
    flex-basis: 280px !important;

    .vc-app_mobile & {
      flex-grow: 1 !important;
      flex-basis: 0 !important;
    }

    &__title {
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      color: #a9bfd2;
      text-align: center;
      margin-top: var(--margin-s);
    }

    &__value {
      font-size: 26px;
      font-weight: var(--font-weight-medium);
      color: #319ed4;
      text-align: center;
    }
  }

  &-review-header {
    color: #319ed4;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-l);
    margin: var(--margin-xs) 0;
  }

  &-offers {
    &__counter {
      flex-grow: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #e5e5e5;
      padding: var(--padding-xl);

      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }

      &:first-child {
        border-top: 1px solid #e5e5e5;
      }

      &-value {
        font-size: 32px;
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--margin-s);

        &_error {
          color: #ff4a4a;
        }

        &_warning {
          color: #f89406;
        }
      }

      &-title {
        font-weight: var(--font-weight-bold);
        color: #6b7987;
      }
    }
  }
}

.vc-separator {
  height: 1px;
  background: #e3e7ec;
}
</style>
