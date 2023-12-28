<template>
  <VcContainer
    class="dashboard tw-w-full tw-h-full tw-box-border"
    no-padding
  >
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
            <modules.Rating.RatingDashboardCard></modules.Rating.RatingDashboardCard>
          </VcCol>
        </VcRow>

        <VcRow>
          <!-- Latest products block -->
          <VcCol
            size="3"
            class="tw-p-2"
          >
            <modules.Products.components.ProductsDashboardCard></modules.Products.components.ProductsDashboardCard>
          </VcCol>

          <!-- Offers block -->
          <VcCol
            size="4"
            class="tw-p-2"
          >
            <modules.Offers.components.OffersDashboardCard></modules.Offers.components.OffersDashboardCard>
          </VcCol>
        </VcRow>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { useBladeNavigation, ITableColumns, notification, useErrorHandler } from "@vc-shell/framework";
import { computed, onMounted, ref, watch } from "vue";
import { OrderLineItem } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useI18n } from "vue-i18n";
import { default as modules, UserPermissions } from "@vcmp-vendor-portal/modules";
import { CustomerOrder } from "@vcmp-vendor-portal/api/orders";

const { t } = useI18n({ useScope: "global" });
const { orders, loadOrders, loading: ordersLoading } = modules.Orders.useOrders();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { error, reset } = useErrorHandler(true);

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
});

function open(key: string): void {
  switch (key) {
    case "orders-list":
      openBlade(
        {
          blade: resolveBladeByName("OrdersList"),
        },
        true,
      );
      break;
  }
}

async function ordersClick(item: CustomerOrder) {
  await openBlade(
    {
      blade: resolveBladeByName("OrdersList"),
      param: item.id,
    },
    true,
  );
}

function calcQty(items: OrderLineItem[]) {
  return items.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
}
</script>

<style lang="scss">
.dashboard {
  --card-header-background: transparent;

  &-header {
    @apply tw-text-[25px] tw-text-[#333333] tw-mb-3 tw-pt-[22px] tw-px-2;
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
}

.vc-separator {
  @apply tw-h-px tw-bg-[#e3e7ec];
}
</style>
