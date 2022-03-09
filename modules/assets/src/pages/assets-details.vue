<template>
  <VcBlade
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
        <VcContainer :no-padding="true">
          <div class="vc-padding_l">
            <VcForm>
              <VcImage
                class="vc-margin-bottom_l"
                :src="localImage.url"
                size="xl"
                :bordered="true"
              ></VcImage>
              <VcInput
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="localImage.name"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></VcInput>
              <VcInput
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="localImage.altText"
                :clearable="true"
                :required="true"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
              ></VcInput>
              <VcTextarea
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="localImage.description"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
              ></VcTextarea>
            </VcForm>
          </div>
        </VcContainer>
      </div>
    </div>
  </VcBlade>
</template>

<script lang="ts" setup>
import { PropType, reactive } from "vue";
import { useI18n } from "@virtoshell/core";
import { Image } from "@virtoshell/api-client";

const props = defineProps({
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
      images: Image[];
    }>,
    default: () => ({}),
  },
});
const emit = defineEmits(["parent:call", "page:close"]);
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
  const images = props.options.images;
  const image = new Image(localImage);
  if (images.length) {
    const imageIndex = images.findIndex((img) => img.id === localImage.id);

    remove ? images.splice(imageIndex, 1) : (images[imageIndex] = image);

    emit("parent:call", { method: "editImages", args: images });
    emit("page:close");
  }
}
</script>

<style lang="less">
.assets-details {
  &__inner {
    border-top: 1px solid #eaedf3;
    overflow: hidden;
  }
}
</style>
