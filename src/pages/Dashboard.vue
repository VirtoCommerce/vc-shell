<template>
  <VcContainer class="dashboard tw-w-full tw-h-full tw-box-border">
    <div
      v-if="$isDesktop.value"
      class="dashboard-header"
    >
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>
    <VcRow>
      <VcCol size="10">
        <VcRow>
          <!-- Latest orders block -->
          <VcCol
            size="3"
            class="tw-p-2"
          >
            <VcCard
              v-if="$isDesktop.value"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
            >
              <template #actions>
                <vc-button
                  small
                  outline
                  @click="open('orders-list')"
                  >{{ $t("SHELL.DASHBOARD.ORDERS.ALL") }}</vc-button
                >
              </template>

              <VcTable
                class="tw-w-full tw-h-full tw-box-border"
                :loading="ordersLoading"
                :items="orders"
                :columns="ordersColumns"
                :header="false"
                :footer="false"
                state-key="dashboard_orders"
                @item-click="ordersClick"
              >
                <!-- Empty template -->
                <template #empty>
                  <div
                    class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-5"
                  >
                    <img src="/assets/empty.png" />
                    <div class="tw-m-4 tw-text-xl tw-font-medium">
                      {{ $t("SHELL.DASHBOARD.ORDERS.EMPTY") }}
                    </div>
                  </div>
                </template>

                <!-- Override qty column template -->
                <template #item_items="itemData">
                  {{ calcQty(itemData.item.items as OrderLineItem[]) }}
                </template>

                <!-- Override status column template -->
                <template #item_status="itemData">
                  <VcStatus v-bind="statusStyle(itemData.item.status as string)">
                    {{ itemData.item.status }}
                  </VcStatus>
                </template>
              </VcTable>
            </VcCard>
            <VcCard
              v-else
              class="tw-mb-4"
              :header="$t('SHELL.DASHBOARD.ORDERS.TITLE')"
              icon="fas fa-file-alt"
              @click="open('orders-list')"
            >
              <div class="tw-h-px tw-bg-[#e3e7ec]"></div>
              <div class="tw-my-4 dashboard-counters__value">3,334</div>
            </VcCard>
          </VcCol>

          <!-- Rating & Reviews block -->
          <VcCol
            v-if="$hasAccess(UserPermissions.ManageSellerReviews)"
            size="4"
            class="tw-p-2"
          >
            <RatingDashboardCard :open-page="openBlade"></RatingDashboardCard>
          </VcCol>
        </VcRow>

        <VcRow>
          <!-- Latest products block -->
          <VcCol
            size="3"
            class="tw-p-2"
          >
            <VcCard
              v-if="$isDesktop.value"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
            >
              <template #actions>
                <vc-button
                  small
                  outline
                  @click="open('products-list')"
                  >{{ $t("SHELL.DASHBOARD.PRODUCTS.ALL") }}</vc-button
                >
              </template>

              <VcTable
                class="tw-w-full tw-h-full tw-box-border"
                :loading="productsLoading"
                :items="products"
                :columns="productsColumns"
                :header="false"
                :footer="false"
                state-key="dashboard_products"
                @item-click="productsClick"
              >
                <!-- Empty template -->
                <template #empty>
                  <div
                    class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-5"
                  >
                    <img src="/assets/empty.png" />
                    <div class="tw-m-4 tw-text-xl tw-font-medium">
                      {{ $t("SHELL.DASHBOARD.PRODUCTS.EMPTY") }}
                    </div>
                    <vc-button @click="open('products-add')">{{ $t("SHELL.DASHBOARD.PRODUCTS.ADD") }}</vc-button>
                  </div>
                </template>

                <!-- Override name column template -->
                <template #item_name="itemData">
                  <div class="tw-flex tw-flex-col">
                    <div class="tw-truncate">
                      {{ itemData.item.name }}
                    </div>
                    <VcHint class="tw-truncate tw-mt-1">
                      {{ itemData.item.path }}
                    </VcHint>
                  </div>
                </template>

                <!-- Override status column template -->
                <template #item_status="itemData">
                  <mp-product-status :status="itemData.item.status as string" />
                </template>
              </VcTable>
            </VcCard>
            <VcCard
              v-else
              class="tw-mb-4"
              :header="$t('SHELL.DASHBOARD.PRODUCTS.TITLE')"
              icon="fas fa-box-open"
              @click="open('products-list')"
            >
              <div class="tw-h-px tw-bg-[#e3e7ec]"></div>
              <div class="tw-my-4 dashboard-counters__value">49</div>
            </VcCard>
          </VcCol>

          <!-- Offers block -->
          <VcCol
            size="4"
            class="tw-p-2"
          >
            <VcCard
              v-if="$isDesktop.value"
              :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
              icon="fas fa-file-invoice"
            >
              <template #actions>
                <vc-button
                  small
                  class="tw-mr-3"
                  @click="open('offers-add')"
                  >{{ $t("SHELL.DASHBOARD.OFFERS.ADD") }}</vc-button
                >
                <vc-button
                  small
                  outline
                  @click="open('offers-list')"
                  >{{ $t("SHELL.DASHBOARD.OFFERS.ALL") }}</vc-button
                >
              </template>

              <VcRow>
                <VcCol style="display: block">
                  <VcTable
                    class="tw-w-full tw-h-full tw-box-border"
                    :loading="offersLoading"
                    :items="offers"
                    :columns="offersColumns"
                    :header="false"
                    :footer="false"
                    state-key="dashboard_offers"
                    @item-click="offersClick"
                  >
                    <!-- Empty template -->
                    <template #empty>
                      <div
                        class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-5"
                      >
                        <img src="/assets/empty.png" />
                        <div class="tw-m-4 tw-text-xl tw-font-medium">
                          {{ $t("SHELL.DASHBOARD.OFFERS.EMPTY") }}
                        </div>
                        <vc-button @click="open('offers-add')">{{ $t("SHELL.DASHBOARD.OFFERS.ADD") }}</vc-button>
                      </div>
                    </template>

                    <!-- Override alwaysInStock column template -->
                    <template #item_alwaysInStock="itemData">
                      <div class="tw-flex tw-justify-center">
                        <VcStatusIcon :status="!itemData"></VcStatusIcon>
                      </div>
                    </template>
                  </VcTable>
                </VcCol>
              </VcRow>
            </VcCard>
            <VcCard
              v-else
              class="tw-mb-4"
              :header="$t('SHELL.DASHBOARD.OFFERS.TITLE')"
              icon="fas fa-file-invoice"
              @click="open('offers-list')"
            >
              <div class="tw-h-px tw-bg-[#e3e7ec]"></div>
              <div class="tw-my-4 dashboard-counters__value">206</div>
            </VcCard>
          </VcCol>
        </VcRow>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { useBladeNavigation, ITableColumns, notification, useErrorHandler } from "@vc-shell/framework";
import { computed, onMounted, ref, watch, markRaw } from "vue";
import { OrderLineItem } from "../api_client/marketplacevendor";
import { OffersList, useOffers } from "../modules/offers";
import { OrdersList, useOrders } from "../modules/orders";
import { MpProductStatus, ProductsList, useProducts } from "../modules/products";
import { RatingDashboardCard } from "../modules/rating";
import { useI18n } from "vue-i18n";
import { UserPermissions } from "./../types";

const { t } = useI18n({ useScope: "global" });
const { products, loadProducts, loading: productsLoading } = useProducts();
const { orders, loadOrders, loading: ordersLoading } = useOrders();
const { offers, loadOffers, loading: offersLoading } = useOffers();

const { openBlade } = useBladeNavigation();
const { error, reset } = useErrorHandler(true);

const productsColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    width: "20%",
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    width: "25%",
  },
  {
    id: "createdDate",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: "25%",
    type: "date-ago",
  },
  {
    id: "status",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: "40%",
  },
]);

const ordersColumns = ref<ITableColumns[]>([
  {
    id: "number",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
    width: "20%",
  },
  {
    id: "items",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.QTY")),
    width: "20%",
  },
  {
    id: "status",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: "40%",
    type: "status",
  },
  {
    id: "createdDate",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED")),
    width: "40%",
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

const statusStyle = (status: string) => {
  const result: {
    outline: boolean;
    variant: "success" | "danger" | "info";
  } = {
    outline: true,
    variant: "info",
  };

  switch (status) {
    case "Published":
      result.outline = false;
      result.variant = "success";
      break;
    case "New":
      result.outline = false;
      result.variant = "success";
      break;
    case "Cancelled":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Shipped":
      result.outline = true;
      result.variant = "success";
  }
  return result;
};

watch(error, (newVal) => {
  if (newVal) {
    notification.error(newVal, {
      timeout: 5000,
      onOpen() {
        reset();
      },
    });
  }
});

onMounted(async () => {
  loadOrders({ take: 5 });
  loadProducts({ take: 5 });
  loadOffers({ take: 5 });
});

function open(key: string): void {
  switch (key) {
    case "orders-list":
      openBlade(
        {
          blade: markRaw(OrdersList),
        },
        true
      );
      break;
    case "products-list":
      openBlade(
        {
          blade: markRaw(ProductsList),
        },
        true
      );
      break;
    case "products-add":
      openBlade(
        {
          blade: markRaw(ProductsList),
        },
        true
      );
      break;
    case "offers-list":
      openBlade(
        {
          blade: markRaw(OffersList),
        },
        true
      );
      break;
    case "offers-add":
      openBlade(
        {
          blade: markRaw(OffersList),
          options: {
            addOffer: true,
          },
        },
        true
      );
      break;
  }
}

function ordersClick(item: { id: string }): void {
  openBlade(
    {
      blade: markRaw(OrdersList),
      param: item.id,
    },
    true
  );
}

function productsClick(item: { id: string }): void {
  openBlade(
    {
      blade: markRaw(ProductsList),
      param: item.id,
    },
    true
  );
}

function offersClick(item: { id: string }): void {
  openBlade(
    {
      blade: markRaw(OffersList),
      param: item.id,
    },
    true
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
    @apply tw-text-[25px] tw-text-[#333333] tw-my-3 tw-px-2;
  }

  .vc-row {
    .vc-app_mobile & {
      @apply tw-flex;
    }
  }

  &-counters {
    @apply tw-grow-0 tw-basis-[280px] #{!important};

    .vc-app_mobile & {
      @apply tw-grow tw-basis-0 #{!important};
    }

    &__title {
      @apply tw-text-[14px] tw-font-medium tw-text-[#a9bfd2]
        tw-text-center tw-mt-2;
    }

    &__value {
      @apply tw-text-[26px] tw-font-medium tw-text-[#319ed4] tw-text-center;
    }
  }

  &-review-header {
    @apply tw-text-[#319ed4] tw-font-medium tw-text-lg tw-my-1;
  }

  &-offers {
    &__counter {
      @apply tw-grow tw-text-center tw-flex tw-flex-col tw-items-center
        tw-justify-center tw-border-l tw-border-solid tw-border-l-[#e5e5e5]
        tw-p-5 tw-border-b tw-border-b-[#e5e5e5] last:tw-border-b-0
        first:tw-border-t first:tw-border-solid first:tw-border-t-[#e5e5e5];

      &-value {
        @apply tw-text-[32px] tw-font-medium tw-mb-2;

        &_error {
          @apply tw-text-[#ff4a4a];
        }

        &_warning {
          @apply tw-text-[#f89406];
        }
      }

      &-title {
        @apply tw-font-bold tw-text-[#6b7987];
      }
    }
  }
}

.vc-separator {
  @apply tw-h-px tw-bg-[#e3e7ec];
}
</style>
