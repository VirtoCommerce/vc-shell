<template>
  <vc-container class="vc-fill_all">
    <h1 class="vc-padding-horizontal_s">Dashboard</h1>

    <vc-row>
      <!-- Latest orders block -->
      <vc-col size="5">
        <vc-card header="Latest orders">
          <template v-slot:actions>
            <vc-button outline @click="open('orders-list')"
              >All orders</vc-button
            >
          </template>

          <vc-table
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
                <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
                  There are no orders yet
                </div>
              </div>
            </template>

            <!-- Override createdDate column template -->
            <template v-slot:item_createdDate="itemData">
              <div class="vc-orders-page__created">
                {{ moment(itemData.item.createdDate).fromNow() }}
              </div>
            </template>

            <!-- Override status column template -->
            <template v-slot:item_status="itemData">
              <vc-status>
                {{ itemData.item.status }}
              </vc-status>
            </template>

            <!-- Override total column template -->
            <template v-slot:item_total="itemData">
              {{ itemData.item.total }} {{ itemData.item.currency }}
            </template>
          </vc-table>
        </vc-card>
      </vc-col>

      <!-- Latest products block -->
      <vc-col size="3">
        <vc-card header="Latest products">
          <template v-slot:actions>
            <vc-button outline @click="open('products-list')"
              >All products</vc-button
            >
          </template>

          <vc-table
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
                <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
                  There are no products yet
                </div>
                <vc-button @click="open('products-add')">Add product</vc-button>
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

            <!-- Override image column template -->
            <template v-slot:item_image="itemData">
              <vc-image
                :bordered="true"
                size="s"
                aspect="1x1"
                :src="itemData.item.imgSrc"
              />
            </template>

            <!-- Override status column template -->
            <template v-slot:item_status="itemData">
              <mp-product-status :status="itemData.item.status" />
            </template>

            <!-- Override createdDate column template -->
            <template v-slot:item_createdDate="itemData">
              {{ moment(itemData.item.createdDate).fromNow() }}
            </template>
          </vc-table>
        </vc-card>
      </vc-col>
    </vc-row>

    <vc-row>
      <!-- Offers updates block -->
      <vc-col size="8">
        <vc-card header="Offer`s updates">
          <template v-slot:actions>
            <vc-button class="vc-margin-right_m" @click="open('offers-add')"
              >Add offer</vc-button
            >
            <vc-button outline @click="open('offers-list')"
              >All offers</vc-button
            >
          </template>

          <vc-table
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
                <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
                  There are no offers yet
                </div>
                <vc-button @click="open('offers-add')">Add offer</vc-button>
              </div>
            </template>

            <!-- Override sellerName column template -->
            <template v-slot:item_name="itemData">
              <div class="vc-flex vc-flex-column">
                <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                <vc-hint class="vc-ellipsis">{{ itemData.item.name }}</vc-hint>
              </div>
            </template>

            <!-- Override image column template -->
            <template v-slot:item_image="itemData">
              <vc-image
                :bordered="true"
                size="s"
                aspect="1x1"
                :src="itemData.item.imgSrc"
              ></vc-image>
            </template>

            <!-- Override createdDate column template -->
            <template v-slot:item_createdDate="itemData">
              {{ moment(itemData.item.createdDate).fromNow() }}
            </template>

            <!-- Override listPrice column template -->
            <template v-slot:item_listPrice="itemData">
              {{ itemData.item.listPrice?.toFixed(2) }}
            </template>

            <!-- Override salePrice column template -->
            <template v-slot:item_salePrice="itemData">
              {{ itemData.item.salePrice?.toFixed(2) }}
            </template>
          </vc-table>
        </vc-card>
      </vc-col>

      <!-- Counters block -->
      <vc-col size="2">
        <vc-card class="vc-margin-bottom_l dashboard-counters">
          <div
            class="vc-fill_width vc-flex vc-flex-column vc-flex-justify_center"
          >
            <div class="dashboard-counters__value">3,844,134.43 USD</div>
            <div class="dashboard-counters__title">Revenue</div>
          </div>
        </vc-card>

        <vc-card class="vc-margin-bottom_l dashboard-counters">
          <div
            class="vc-fill_width vc-flex vc-flex-column vc-flex-justify_center"
          >
            <div class="dashboard-counters__value">10,664.83 USD</div>
            <div class="dashboard-counters__title">Average order value</div>
          </div>
        </vc-card>

        <vc-card class="dashboard-counters">
          <div
            class="vc-fill_width vc-flex vc-flex-column vc-flex-justify_center"
          >
            <div class="dashboard-counters__value">981</div>
            <div class="dashboard-counters__title">Items purchased</div>
          </div>
        </vc-card>
      </vc-col>
    </vc-row>
  </vc-container>
</template>

<script lang="ts">
import { useI18n } from "@virtoshell/core";
import { defineComponent, onMounted, ref } from "vue";
import { OffersDetails, OffersList, useOffers } from "../modules/offers";
import { OrdersEdit, OrdersList, useOrders } from "../modules/orders";
import {
  ProductsEdit,
  ProductsList,
  useProducts,
  MpProductStatus,
} from "../modules/products";
import moment from "moment";

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

    const productsColumns = ref([
      {
        id: "image",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE"),
        width: 60,
      },
      {
        id: "name",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME"),
      },
      {
        id: "createdDate",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 140,
      },
      {
        id: "status",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS"),
        width: 180,
      },
    ]);

    const ordersColumns = ref([
      {
        id: "number",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER"),
        width: 160,
      },
      {
        id: "customerName",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER"),
      },
      {
        id: "total",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL"),
        width: 120,
      },
      {
        id: "status",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS"),
      },
      {
        id: "createdDate",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED"),
      },
    ]);

    const offersColumns = ref([
      {
        id: "image",
        field: "image",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE"),
        width: 60,
      },
      {
        id: "name",
        field: "name",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME"),
      },
      {
        id: "createdDate",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 140,
      },
      {
        id: "sku",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU"),
        width: 120,
      },
      {
        id: "salePrice",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.SALE_PRICE"),
        width: 100,
      },
      {
        id: "listPrice",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.LIST_PRICE"),
        width: 100,
      },
      {
        id: "minQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY"),
        width: 80,
      },
      {
        id: "inStockQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY"),
        width: 80,
      },
    ]);

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
      });
      props.openPage(1, {
        component: OrdersEdit,
        param: item.id,
      });
    }

    function productsClick(item: { id: string }): void {
      props.openPage(0, {
        component: ProductsList,
      });
      props.openPage(1, {
        component: ProductsEdit,
        param: item.id,
      });
    }

    function offersClick(item: { id: string }): void {
      props.openPage(0, {
        component: OffersList,
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
    };
  },
});
</script>

<style lang="less">
.dashboard-counters {
  min-height: 126px;

  &__title {
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: #a9bfd2;
    text-align: center;
    margin-top: var(--margin-s);
  }

  &__value {
    font-size: 24px;
    font-weight: var(--font-weight-medium);
    color: #6c96ba;
    text-align: center;
  }
}
</style>
