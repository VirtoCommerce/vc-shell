<template>
  <vc-blade
    :title="$t('PRODUCTS.PAGES.DETAILS.TITLE')"
    :width="400"
    :expanded="expanded"
    :closable="true"
    @expand="expanded = true"
    @collapse="expanded = false"
    :toolbarItems="bladeToolbar"
  >
    <div class="product-details__inner vc-flex">
      <div class="product-details__content vc-flex-grow_1">
        <vc-container :shadow="true">
          <div class="vc-padding_s">
            <vc-form>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
              >
                <vc-form-input
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                  "
                ></vc-form-input>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
              >
                <vc-form-select
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')
                  "
                ></vc-form-select>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
              >
                <vc-form-input
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')
                  "
                ></vc-form-input>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
              >
                <vc-textarea
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                  "
                ></vc-textarea>
              </vc-form-field>
            </vc-form>
          </div>
        </vc-container>
      </div>
      <div class="product-details__widgets">Widgets</div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const expanded = ref(true);

    const bladeToolbar = [
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
      },
      {
        id: "saveAndApprove",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE"),
        icon: "fas fa-share-square",
      },
    ];

    return {
      expanded,
      bladeToolbar,
    };
  },
});
</script>

<style lang="less">
.product-details {
  &__inner {
    border-top: 1px solid #eaedf3;
  }

  &__content {
    border-right: 1px solid #eaedf3;
  }

  &__widgets {
    padding: var(--padding-l);
  }
}
</style>
