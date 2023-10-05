import { computed, h, markRaw, ref, unref, watch } from "vue";
import { Gallery } from "../factories";
import componentProps from "./props";
import { useAssets } from "../../../../../core/composables";
import { IImage } from "../../../../../core/types";

import { Image } from "./../../../../../core/api/catalog";
import { useBladeNavigation, usePopup } from "./../../../../components";
import { useI18n } from "vue-i18n";
import { AssetsDetails } from "../../../assets";
import { reactiveComputed } from "@vueuse/core";
import * as _ from "lodash-es";

export default {
  name: "GalleryField",
  props: componentProps,
  setup(props, ctx) {
    const internalModel = ref();

    watch(
      () => props.formData,
      (newVal) => {
        if (!_.isEqual(internalModel.value, newVal)) {
          internalModel.value = newVal;
        }
      },
      { deep: true, immediate: true }
    );
    const { showConfirmation } = usePopup();
    const { t } = useI18n({ useScope: "global" });
    const { openBlade } = useBladeNavigation();

    const imageHandlers = imageHandler();
    function imageHandler() {
      const { edit, remove, upload, loading } = useAssets(Image);
      return {
        loading: computed(() => loading.value),

        async edit(image: IImage) {
          internalModel.value.images = await edit(props.formData[props.element.property], image);
          await editImages(internalModel.value.images);
        },
        async upload(files: FileList) {
          internalModel.value.images = await upload(
            files,
            props.formData[props.element.property],
            props.formData.id || props.formData.categoryId,
            props.element.uploadFolder
          );

          files = null;

          await editImages(internalModel.value.images);

          return internalModel.value.images;
        },
        async remove(image: IImage) {
          if (
            await showConfirmation(
              computed(() =>
                t(
                  `${props.bladeContext.settings.localizationPrefix
                    .trim()
                    .toUpperCase()}.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION`
                )
              )
            )
          ) {
            internalModel.value.images = await remove(props.formData[props.element.property], image);
            await editImages(internalModel.value.images);
          }
          return internalModel.value.images;
        },
      };
    }

    function onGalleryItemEdit(item: Image) {
      openBlade({
        blade: markRaw(AssetsDetails),
        options: {
          asset: item,
          assetEditHandler: imageHandlers.edit,
          assetRemoveHandler: imageHandlers.remove,
        },
      });
    }

    async function editImages(args: Image[]) {
      internalModel.value.images = args;
      ctx.emit("change", internalModel.value);
      await props.bladeContext.validationState.validate();
    }

    const field = reactiveComputed(() =>
      Gallery({
        props: {
          ...props.baseProps,
          loading: imageHandlers.loading,
          images: props.baseProps.modelValue,
          multiple: true,
          onUpload: imageHandlers.upload,
          onRemove: imageHandlers.remove,
          onEdit: onGalleryItemEdit,
          onSort: editImages,
        },
        options: props.baseOptions,
      })
    );

    return () => h(field.component, field.props);
  },
};
