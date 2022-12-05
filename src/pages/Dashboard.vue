<template>
  <VcContainer class="dashboard w-full h-full box-border">
    <div class="dashboard-header" v-if="$isDesktop.value">
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>

    <VcRow>
      <VcCol size="10">
        <VcRow>
          <!-- Latest orders block -->
          <VcCol size="3" class="p-2">
            <VcCard
              v-if="$isDesktop.value"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('orders-list')">{{
                  $t("SHELL.DASHBOARD.ORDERS.ALL")
                }}</vc-button>
              </template>

              <VcTable
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
                    <img src="/assets/empty.png" />
                    <div class="m-4 text-xl font-medium">
                      {{ $t("SHELL.DASHBOARD.ORDERS.EMPTY") }}
                    </div>
                  </div>
                </template>

                <!-- Override qty column template -->
                <template v-slot:item_items="itemData">
                  {{ calcQty(itemData.item.items) }}
                </template>
              </VcTable>
            </VcCard>
            <VcCard
              v-else
              class="mb-4"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
              @click="open('orders-list')"
            >
              <div class="h-px bg-[#e3e7ec]"></div>
              <div class="my-4 dashboard-counters__value">3,334</div>
            </VcCard>
          </VcCol>

          <!-- Rating & Reviews block -->
          <VcCol size="4" class="p-2">
            <RatingDashboardCard :open-page="openBlade"></RatingDashboardCard>
          </VcCol>
        </VcRow>

        <VcRow>
          <!-- Latest products block -->
          <VcCol size="3" class="p-2">
            <VcCard
              v-if="$isDesktop.value"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
            >
              <template v-slot:actions>
                <vc-button small outline @click="open('products-list')">{{
                  $t("SHELL.DASHBOARD.PRODUCTS.ALL")
                }}</vc-button>
              </template>

              <VcTable
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
                    <img src="/assets/empty.png" />
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
                      class="truncate"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <VcHint
                      class="truncate mt-1"
                    >
                      {{ itemData.item.path }}
                    </VcHint>
                  </div>
                </template>

                <!-- Override status column template -->
                <template v-slot:item_status="itemData">
                  <mp-product-status
                    :status="itemData.item.status"
                    class="mb-1"
                  />
                </template>
              </VcTable>
            </VcCard>
            <VcCard
              v-else
              class="mb-4"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
              @click="open('products-list')"
            >
              <div class="h-px bg-[#e3e7ec]"></div>
              <div class="my-4 dashboard-counters__value">49</div>
            </VcCard>
          </VcCol>

          <!-- Offers block -->
          <VcCol size="4" class="p-2">
            <VcCard
              v-if="$isDesktop.value"
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
                        <img src="/assets/empty.png" />
                        <div class="m-4 text-xl font-medium">
                          {{ $t("SHELL.DASHBOARD.OFFERS.EMPTY") }}
                        </div>
                        <vc-button @click="open('offers-add')">{{
                          $t("SHELL.DASHBOARD.OFFERS.ADD")
                        }}</vc-button>
                      </div>
                    </template>

                    <!-- Override alwaysInStock column template -->
                    <template v-slot:item_alwaysInStock="itemData">
                      <div class="flex justify-center">
                        <VcStatusIcon :status="!itemData"></VcStatusIcon>
                      </div>
                    </template>
                  </vc-table>
                </VcCol>
              </VcRow>
            </VcCard>
            <VcCard
              v-else
              class="mb-4"
              :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
              icon="fas fa-file-invoice"
              @click="open('offers-list')"
            >
              <div class="h-px bg-[#e3e7ec]"></div>
              <div class="my-4 dashboard-counters__value">206</div>
            </VcCard>
          </VcCol>
        </VcRow>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { useI18n, useBladeNavigation, ITableColumns } from "@vc-shell/framework";
import { computed, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { OrderLineItem } from "../api_client/orders";
import { OffersDetails, OffersList, useOffers } from "../modules/offers";
import { OrdersEdit, OrdersList, useOrders } from "../modules/orders";
import {
  MpProductStatus,
  ProductsEdit,
  ProductsList,
  useProducts,
} from "../modules/products";
import { RatingDashboardCard } from "../modules/rating";

const { t } = useI18n();
const { products, loadProducts, loading: productsLoading } = useProducts();
const { orders, loadOrders, loading: ordersLoading } = useOrders();
const { offers, loadOffers, loading: offersLoading } = useOffers();
const router = useRouter();
const { openBlade } = useBladeNavigation();

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
    width: 100,
    type: "date-ago",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU")),
    width: 120,
  },
  {
    id: "alwaysInStock",
    field: "trackInventory",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.ALWAYS_IN_STOCK")),
    width: 80,
  },
  {
    id: "inStockQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY")),
    width: 80,
    type: "number",
  },
  {
    id: "availQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.AVAIL_QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
  {
    id: "validFrom",
    field: "startDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.VALID_FROM")),
    width: 100,
    type: "date-time",
  },
  {
    id: "validTo",
    field: "endDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.VALID_TO")),
    width: 100,
    type: "date-time",
  },
]);

onMounted(async () => {
  router.push("/");
  loadOrders({ take: 5 });
  loadProducts({ take: 5 });
  loadOffers({ take: 5 });
});

function open(key: string): void {
  switch (key) {
    case "orders-list":
      openBlade(
        {
          parentBlade: shallowRef(OrdersList),
        },
        0
      );
      break;
    case "products-list":
      openBlade(
        {
          parentBlade: shallowRef(ProductsList),
        },
        0
      );
      break;
    case "products-add":
      openBlade(
        {
          parentBlade: shallowRef(ProductsList),
        },
        0
      );
      openBlade(
        {
          parentBlade: shallowRef(ProductsEdit),
        },
        1
      );
      break;
    case "offers-list":
      openBlade(
        {
          parentBlade: shallowRef(OffersList),
        },
        0
      );
      break;
    case "offers-add":
      openBlade(
        {
          parentBlade: shallowRef(OffersList),
        },
        0
      );
      openBlade(
        {
          component: shallowRef(OffersDetails),
        },
        1
      );
      break;
  }
}

function ordersClick(item: { id: string }): void {
  openBlade(
    {
      parentBlade: shallowRef(OrdersList),
      param: item.id,
    },
    0
  );
  openBlade(
    {
      parentBlade: shallowRef(OrdersEdit),
      param: item.id,
    },
    1
  );
}

function productsClick(item: { id: string }): void {
  openBlade(
    {
      parentBlade: shallowRef(ProductsList),
      param: item.id,
    },
    0
  );
  openBlade(
    {
      parentBlade: shallowRef(ProductsEdit),
      param: item.id,
    },
    1
  );
}

function offersClick(item: { id: string }): void {
  openBlade(
    {
      parentBlade: shallowRef(OffersList),
      param: item.id,
    },
    0
  );
  openBlade(
    {
      parentBlade: shallowRef(OffersDetails),
      param: item.id,
    },
    1
  );
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

  .vc-row {
    .vc-app_mobile & {
      @apply flex;
    }
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
