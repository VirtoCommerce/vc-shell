<template>
  <vc-blade
    :title="options.editableAsset.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <div class="assets-details__inner vc-flex vc-flex-grow_1">
      <div class="assets-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
          <div class="vc-padding_l">
            <vc-form>
              <vc-image
                class="vc-margin-bottom_l"
                :src="localImage.url"
                size="xl"
                :bordered="true"
              ></vc-image>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="localImage.name"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></vc-input>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="localImage.alt"
                :clearable="true"
                :required="true"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
              ></vc-input>
              <vc-textarea
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="localImage.description"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
              ></vc-textarea>
            </vc-form>
          </div>
        </vc-container>
      </div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, unref, isRef } from "vue";
import { useI18n } from "@virtoshell/core";
import {
  Image,
  ProductDetails,
} from "./../../../../apps/vendor-portal/src/api_client";

export default defineComponent({
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    options: {
      type: Object as PropType<{
        editableAsset: Image;
        product: ProductDetails;
      }>,
      default: () => ({}),
    },
  },

  emits: ["parent:call", "page:close"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const localImage = reactive({ ...props.options.editableAsset });

    const bladeToolbar = [
      {
        id: "save",
        title: t("ASSETS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        clickHandler() {
          mutateImage();
        },
      },
      {
        id: "delete",
        title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
        icon: "fas fa-trash",
        clickHandler() {
          mutateImage(true);
        },
      },
    ];

    function mutateImage(remove = false) {
      const product = props.options.product;
      const image = new Image(localImage);
      if ("images" in product && product.images) {
        const imageIndex = product.images.findIndex(
          (img) => img.id === localImage.id
        );

        remove
          ? product.images.splice(imageIndex, 1)
          : (product.images[imageIndex] = image);

        emit("parent:call", { method: "editImages", args: product.images });
        emit("page:close");
      }
    }

    return {
      bladeToolbar,
      localImage,
    };
  },
});
</script>

<style lang="less">
.assets-details {
  &__inner {
    border-top: 1px solid #eaedf3;
    overflow: hidden;
  }
}
</style>
