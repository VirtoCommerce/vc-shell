import { Component, ExtractPropTypes, computed, h, markRaw, reactive, ref, toRefs, toValue, unref, watch } from "vue";
import { Gallery } from "../factories";
import componentProps from "./props";
import { IImage } from "../../../../../core/types";
import { useBladeNavigation, usePopup } from "./../../../../components";
import { useI18n } from "vue-i18n";
import { default as AssetsDetails } from "../../../assets/components/assets-details/assets-details.vue";
import * as _ from "lodash-es";
import { GallerySchema } from "../../types";
import { unrefNested } from "./../../helpers/unrefNested";
import { setModel } from "../../helpers/setters";
import { safeIn } from "../../helpers/safeIn";

export default {
  name: "GalleryField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: GallerySchema }) {
    if (
      !(
        safeIn("bladeContext", props) &&
        props.bladeContext &&
        safeIn("scope", props.bladeContext) &&
        props.bladeContext.scope &&
        props.bladeContext.scope.assetsHandler?.images
      )
    ) {
      throw new Error(
        `There is no assetsHandler.images config provided in blade scope: ${JSON.stringify(
          props.bladeContext.scope,
          null,
          2
        )}`
      );
    }

    const { showConfirmation } = usePopup();
    const { t } = useI18n({ useScope: "global" });
    const { openBlade } = useBladeNavigation();

    const imagesHandler = toRefs(props.bladeContext.scope?.assetsHandler?.images);
    const internalModel = ref();

    watch(
      () => props.fieldContext,
      (newVal) => {
        if (!_.isEqual(internalModel.value, newVal)) {
          internalModel.value = _.cloneDeep(newVal);
        }
      },
      { deep: true, immediate: true }
    );

    return () => {
      const imageHandlers = {
        loading: imagesHandler.loading,
        async edit(image: IImage) {
          internalModel.value[props.element.property] = await imagesHandler.edit?.value?.(
            unref(props.formData)[props.element.property] as IImage[],
            image
          );
          await editImages(internalModel.value[props.element.property]);
        },
        async upload(files: FileList | null) {
          if (files) {
            internalModel.value[props.element.property] = await imagesHandler.upload?.value?.(
              files,
              unref(props.formData)[props.element.property] as IImage[],
              (unref(props.formData).id as string) || (unref(props.formData).categoryId as string),
              props.element.uploadFolder
            );

            files = null;

            await editImages(internalModel.value[props.element.property]);

            return internalModel.value[props.element.property];
          }
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
            internalModel.value[props.element.property] = await imagesHandler.remove?.value?.(
              unref(props.formData)[props.element.property] as IImage[],
              image
            );
            await editImages(internalModel.value[props.element.property]);
          }
          return internalModel.value[props.element.property];
        },
      };

      function onGalleryItemEdit(item: IImage) {
        openBlade({
          blade: markRaw(AssetsDetails),
          options: {
            asset: item,
            assetEditHandler: imageHandlers.edit,
            assetRemoveHandler: imageHandlers.remove,
          },
        });
      }

      async function editImages(args: IImage[]) {
        if (props.fieldContext) {
          internalModel.value[props.element.property] = args;
          setModel({
            property: props.element.property,
            value: args,
            context: props.fieldContext,
            scope: props.bladeContext.scope,
          });
          await props.bladeContext.validationState.validate();
        }
      }

      const field = Gallery({
        props: {
          ...props.baseProps,
          loading: imageHandlers.loading,
          images: props.baseProps.modelValue,
          multiple: props.element.multiple,
          variant: props.element.variant,
          itemActions: props.element.actions,
          onUpload: imageHandlers.upload,
          onRemove: imageHandlers.remove,
          onEdit: onGalleryItemEdit,
          onSort: editImages,
        },
        options: props.baseOptions,
      });

      return props.baseOptions.visibility ? h(field.component as Component, unrefNested(field.props)) : null;
    };
  },
};
