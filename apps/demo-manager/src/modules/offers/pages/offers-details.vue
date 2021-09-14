<template>
  <vc-blade
    :uid="uid"
    :title="$t('OFFERS.PAGES.DETAILS.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$closeBlade(uid)"
  >
    <!-- Blade contents -->
    <div class="offer-details__inner vc-flex vc-flex-grow_1">
      <div class="offer-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
          <div class="vc-padding_l">
            <vc-form>
              <vc-autocomplete
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                :required="true"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')
                "
                :options="products"
              ></vc-autocomplete>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.TITLE')"
                :required="true"
                :options="currencies"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.PLACEHOLDER')
                "
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                :clearable="true"
                :required="true"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
              ></vc-input>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                  :clearable="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.QTY.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.TITLE')"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.TITLE')"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.TITLE')"
                :required="true"
                :options="conditions"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.PLACEHOLDER')
                "
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.TITLE')"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.PLACEHOLDER')
                "
              ></vc-input>
            </vc-form>
          </div>
        </vc-container>
      </div>
      <div class="offer-details__widgets">
        <vc-container :no-padding="true">
          <div class="vc-widget" @click="$openBlade(uid, 'offers-stat')">
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-file-alt"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Statistics</div>
          </div>
        </vc-container>
      </div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n, useRouter } from "@virtoshell/core";

export default defineComponent({
  props: {
    uid: {
      type: String,
      default: undefined,
    },

    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const { t } = useI18n();
    const { closeBlade } = useRouter();

    const bladeToolbar = [
      {
        id: "save",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
      },
      {
        id: "close",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        onClick: () => {
          closeBlade(props.uid);
        },
      },
    ];
    const products = [
      {
        title: "Product 1",
        value: "1",
      },
      {
        title: "Product 2",
        value: "2",
      },
      {
        title: "Product 3",
        value: "3",
      },
      {
        title: "Product 4",
        value: "4",
      },
      {
        title: "Product 5",
        value: "5",
      },
      {
        title: "Product 6",
        value: "6",
      },
      {
        title: "Product 7",
        value: "7",
      },
      {
        title: "Product 8",
        value: "8",
      },
      {
        title: "Product 9",
        value: "9",
      },
      {
        title: "Product 10",
        value: "10",
      },
    ];

    return {
      bladeToolbar,
      currencies: [
        { title: "CAD", value: "CAD" },
        { title: "RUB", value: "RUB" },
        { title: "USD", value: "USD" },
      ],
      conditions: [
        { title: "New", value: "New" },
        { title: "Refurbrished", value: "Refurbrished" },
        { title: "Used", value: "Used" },
      ],
      products,
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
  }
}

.vc-widget {
  display: flex;
  width: 100px;
  overflow: hidden;
  padding: var(--padding-xl);
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eaedf3;
  cursor: pointer;
  background-color: #ffffff;

  &:hover {
    background-color: #dfeef9;
  }

  &__icon {
    color: #a9bfd2;
  }

  &__title {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-s);
    color: #333333;
    margin: var(--margin-m) 0 var(--margin-xs);
  }

  &__value {
    font-weight: var(--font-weight-medium);
    font-size: 22px;
    color: #43b0e6;
  }
}
</style>
