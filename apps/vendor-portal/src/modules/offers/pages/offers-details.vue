<template>
  <vc-blade
    v-loading="loading"
    :title="
      param && offerDetails
        ? offerDetails.sku
        : $t('OFFERS.PAGES.DETAILS.TITLE')
    "
    width="600"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-container :no-padding="true">
      <div class="offer-details__inner vc-flex vc-flex-grow_1">
        <div class="offer-details__content vc-flex-grow_1">
          <div class="vc-padding_l">
            <vc-form>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                :isRequired="true"
                :isSearchable="true"
                v-model="offerDetails.productId"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')
                "
                :options="products"
                :initialItem="offerDetails.product"
                keyProperty="id"
                displayProperty="name"
                @search="onProductSearch"
                :error="
                  validator.productId.$errors[0] &&
                  validator.productId.$errors[0].$message
                "
                :isDisabled="readonly"
              >
                <template v-slot:item="itemData">
                  <div
                    class="
                      vc-flex
                      vc-flex-align_center
                      vc-padding-vertical_s
                      vc-ellipsis
                    "
                  >
                    <vc-image
                      class="vc-flex-shrink_0"
                      size="xs"
                      :src="itemData.item.imgSrc"
                      :bordered="true"
                    ></vc-image>
                    <div class="flex-grow_1 vc-margin-left_l vc-ellipsis">
                      <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                      <vc-hint class="vc-ellipsis vc-margin-top_xs">
                        Code: {{ itemData.item.sku }}
                      </vc-hint>
                    </div>
                  </div>
                </template>
              </vc-select>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.TITLE')"
                :isRequired="true"
                v-model="offerDetails.currency"
                :options="currencies"
                keyProperty="value"
                displayProperty="title"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.PLACEHOLDER')
                "
                :error="
                  validator.currency.$errors[0] &&
                  validator.currency.$errors[0].$message
                "
                :isDisabled="readonly"
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                :clearable="true"
                :required="true"
                v-model="offerDetails.sku"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                :error="
                  validator.sku.$errors[0] && validator.sku.$errors[0].$message
                "
                :disabled="readonly"
              ></vc-input>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.listPrice"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')
                  "
                  :error="
                    validator.listPrice.$errors[0] &&
                    validator.listPrice.$errors[0].$message
                  "
                  :disabled="readonly"
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                  :clearable="true"
                  v-model="offerDetails.salePrice"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')
                  "
                  :error="
                    validator.salePrice.$errors[0] &&
                    validator.salePrice.$errors[0].$message
                  "
                  :disabled="readonly"
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.minQuantity"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                  "
                  :error="
                    validator.minQuantity.$errors[0] &&
                    validator.minQuantity.$errors[0].$message
                  "
                  :disabled="readonly"
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.inStockQuantity"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.QTY.PLACEHOLDER')
                  "
                  :error="
                    validator.inStockQuantity.$errors[0] &&
                    validator.inStockQuantity.$errors[0].$message
                  "
                  :disabled="readonly"
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.TITLE')"
                  :clearable="true"
                  :required="false"
                  offerDetails.startDate
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.PLACEHOLDER')
                  "
                  :disabled="readonly"
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.TITLE')"
                  :clearable="true"
                  :required="false"
                  offerDetails.endDate
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.PLACEHOLDER')
                  "
                  :disabled="readonly"
                ></vc-input>
              </div>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.TITLE')"
                :options="conditions"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.PLACEHOLDER')
                "
                :isDisabled="readonly"
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.TITLE')"
                :clearable="true"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.PLACEHOLDER')
                "
                :disabled="readonly"
              ></vc-input>
            </vc-form>
          </div>
        </div>
        <div class="offer-details__widgets">
          <vc-widget icon="fas fa-file-alt" title="Statistics"></vc-widget>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, reactive } from "vue";
import { useI18n } from "@virtoshell/core";
import { useOffer } from "../composables";
import { IOfferProduct } from "../../../api_client";
import { useVuelidate } from "@vuelidate/core";
import {
  minLength,
  maxLength,
  required,
  minValue,
  decimal,
  integer,
} from "@vuelidate/validators";

export default defineComponent({
  url: "offer",

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

  setup(props, { emit }) {
    const { t } = useI18n();

    const {
      createOffer,
      offerDetails,
      fetchProducts,
      offer,
      loadOffer,
      loading,
    } = useOffer();
    //TODO: bind to dropdown action
    const products = ref<IOfferProduct[]>();
    const currency = { title: "USD", value: "USD" };
    onMounted(async () => {
      if (props.param) {
        await loadOffer({ id: props.param });
      }
      products.value = await fetchProducts();
    });

    const rules = computed(() => ({
      productId: {
        required,
      },
      currency: {
        required,
      },
      sku: {
        required,
        minLength: minLength(4),
        maxLength: maxLength(16),
      },
      listPrice: {
        required,
        decimal,
        minValue: minValue(0.01),
      },
      salePrice: {
        decimal,
        minValue: minValue(0.01),
      },
      minQuantity: {
        required,
        integer,
        minValue: minValue(1),
      },
      inStockQuantity: {
        required,
        integer,
        minValue: minValue(1),
      },
    }));

    const validator = useVuelidate(rules, offerDetails, {
      $autoDirty: true,
      $lazy: true,
    });
    const readonly = computed(() => !!offer.value?.id);

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        async clickHandler() {
          // @ts-ignore
          if (await validator.value.$validate()) {
            try {
              await createOffer({
                ...offerDetails,
                currency: "USD",
              });
              emit("parent:call", {
                method: "reload",
              });
              emit("page:close");
            } catch (err) {
              alert(err.message);
            }
          }
        },
        isVisible: !props.param,
      },
      {
        id: "close",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        async clickHandler() {
          emit("page:close");
        },
      },
    ]);

    return {
      offer,
      loading,
      validator,
      readonly,
      bladeToolbar,
      offerDetails,
      products,
      currency,
      currencies: [{ title: "USD", value: "USD" }],
      conditions: [
        { title: "New", value: "New" },
        { title: "Refurbrished", value: "Refurbrished" },
        { title: "Used", value: "Used" },
      ],
      onProductSearch: async (value: string) => {
        products.value = await fetchProducts(value);
      },
    };
  },
});
</script>

<style lang="less">
.offer-details {
  &__inner {
    border-top: 1px solid #eaedf3;
    overflow: hidden;
  }

  &__content {
    border-right: 1px solid #eaedf3;
    overflow: hidden;
  }

  .vc-app_phone &__inner {
    flex-direction: column;
  }

  .vc-app_phone &__content {
    border-right: none;
    border-bottom: 1px solid #eaedf3;
    overflow: visible;
  }

  .vc-app_phone &__widgets {
    display: flex;
    flex-direction: row;
  }
}
</style>
