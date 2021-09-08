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
              <vc-form-field
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
              >
                <vc-input
                  :clearable="true"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')
                  "
                ></vc-input>
              </vc-form-field>
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

    return {
      bladeToolbar,
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
