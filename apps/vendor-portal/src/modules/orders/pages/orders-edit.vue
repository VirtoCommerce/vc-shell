<template>
  <vc-blade
    v-loading="loading"
    :title="order.number"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <vc-container class="orders-edit-bordered">
      <vc-row>
        <vc-col size="2" class="vc-padding_s">
          <vc-card header="Order info">
            <vc-row class="vc-padding_s">
              <vc-col size="2" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Order reference #"
                  :modelValue="order.number"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Store"
                  :modelValue="order.storeId"
                  placeholder="Not set"
                  tooltip="Shows store where order was placed"
                  :disabled="true"
                ></vc-input>
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Order status"
                  :modelValue="order.status"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
              <vc-col size="1" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Created date/time"
                  :modelValue="createdDate"
                  type="datetime-local"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
            </vc-row>
          </vc-card>
        </vc-col>
        <vc-col size="1" class="vc-padding_s">
          <vc-card header="Customer contact">
            <vc-row class="vc-padding_s">
              <vc-col class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Full name"
                  :modelValue="order.customerName"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Email"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Phone"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
            </vc-row>
          </vc-card>
        </vc-col>
      </vc-row>

      <vc-row>
        <vc-col class="vc-padding_s">
          <vc-card header="Items list">
            <vc-table
              :multiselect="false"
              :columns="columns"
              :items="items"
              :header="false"
              :footer="false"
            >
              <template v-slot:item_imageUrl="itemData">
                <vc-image
                  :bordered="true"
                  :src="itemData.item.imageUrl"
                  aspect="1x1"
                  size="s"
                ></vc-image>
              </template>
              <template v-slot:item_name="itemData">
                <div class="vc-flex vc-flex-column">
                  <div>{{ itemData.item.name }}</div>
                  <vc-hint class="vc-margin-top_xs"
                    >SKU: {{ itemData.item.sku }}</vc-hint
                  >
                </div>
              </template>

              <template v-slot:mobile-item="itemData">
                <div class="vc-padding-vertical_m vc-padding-horizontal_l">
                  <div class="vc-fill_width vc-flex vc-flex-justify_evenly">
                    <vc-image
                      class="vc-flex-shrink_0"
                      aspect="1x1"
                      size="s"
                      :bordered="true"
                      :src="itemData.item.imageUrl"
                    ></vc-image>
                    <div class="vc-flex-grow_1 vc-margin-left_m">
                      <div class="vc-font-weight_bold vc-font-size_l">
                        {{ itemData.item.name }}
                      </div>
                      <vc-hint class="vc-margin-top_xs">
                        SKU: {{ itemData.item.sku }}
                      </vc-hint>
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
                      <vc-hint>Quantity</vc-hint>
                      <div class="vc-ellipsis vc-margin-top_xs">
                        {{ itemData.item.quantity }}
                      </div>
                    </div>
                    <div class="vc-ellipsis vc-flex-grow_2">
                      <vc-hint>Unit price</vc-hint>
                      <div class="vc-ellipsis vc-margin-top_xs">
                        {{
                          itemData.item.price && itemData.item.price.toFixed(2)
                        }}
                      </div>
                    </div>
                    <div class="vc-ellipsis vc-flex-grow_1">
                      <vc-hint>Total</vc-hint>
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
            </vc-table>

            <div
              class="
                orders-totals
                vc-flex vc-flex-row
                vc-flex-justify_end
                vc-padding_l
              "
            >
              <div class="vc-margin-right_xl">
                <span class="vc-margin-right_s">Subtotal:</span>
                <span class="vc-font-weight_bold"
                  >{{ order.subTotal && order.subTotal.toFixed(2) }}
                  {{ order.currency }}</span
                >
              </div>
              <div class="vc-margin-right_xl">
                <span class="vc-margin-right_s">Discount total:</span>
                <span class="vc-font-weight_bold"
                  >{{ order.discountTotal && order.discountTotal.toFixed(2) }}
                  {{ order.currency }}</span
                >
              </div>
              <div class="orders-totals__counter vc-font-weight_bold">
                <span class="vc-margin-right_s">Total:</span>
                <span
                  >{{ order.total && order.total.toFixed(2) }}
                  {{ order.currency }}</span
                >
              </div>
            </div>
          </vc-card>
        </vc-col>
      </vc-row>

      <vc-row>
        <vc-col class="vc-padding_s">
          <vc-card header="Shipping address">
            <vc-row class="vc-padding_s">
              <vc-col size="4" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Country"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
              <vc-col size="2" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="Postal/ZIP code"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
              <vc-col size="3" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="State/Province"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
              <vc-col size="3" class="vc-padding_s">
                <vc-input
                  class="vc-margin-bottom_l"
                  label="City"
                  :clearable="true"
                  placeholder="Not set"
                  :disabled="true"
                ></vc-input>
              </vc-col>
            </vc-row>
          </vc-card>
        </vc-col>
      </vc-row>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, onMounted, defineComponent } from "vue";

import { useOrder } from "../composables";

export default defineComponent({
  url: "order",

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

  setup(props) {
    const { loading, order, loadOrder } = useOrder();

    onMounted(async () => {
      if (props.param) {
        await loadOrder({ id: props.param });
      }
    });

    const bladeToolbar = [
      { title: "Confirm", icon: "fas fa-check", disabled: true },
      { title: "Cancel", icon: "fas fa-times-circle", disabled: true },
    ];

    const columns = [
      {
        id: "imageUrl",
        title: "Pic",
        width: 60,
        class: "vc-padding-right_none",
      },
      {
        id: "name",
        title: "Name",
      },
      {
        id: "quantity",
        title: "Quantity",
        width: 120,
      },
      {
        id: "price",
        title: "Unit price",
        width: 120,
      },
      {
        id: "extendedPrice",
        title: "Total",
        width: 120,
      },
    ];

    return {
      bladeToolbar,
      columns,
      order,
      items: computed(() => order.value?.items),
      loading,
      createdDate: computed(() => {
        const date = new Date(order.value?.createdDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        return `${year}-${month}-${day}T${hour}:${minute}`;
      }),
    };
  },
});
</script>

<style lang="less">
.orders-edit-bordered {
  border-top: 1px solid #eaedf3;
}

.orders-totals {
  background: #fbfdfe;
  box-shadow: inset 0px 4px 7px rgba(199, 213, 227, 0.3);

  &__counter {
    color: #83a6c3;
  }
}
</style>
