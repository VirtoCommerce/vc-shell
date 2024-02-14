import { Component, ExtractPropTypes, computed, h, markRaw, ref, toRefs, toValue, unref, watch } from "vue";
import { Gallery } from "../factories";
import componentProps from "./props";
import { ICommonAsset } from "../../../../../core/types";
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
          2,
        )}`,
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
      { deep: true, immediate: true },
    );

    return () => {
      const imageHandlers = {
        loading: imagesHandler.loading ?? false,
        async edit(image: ICommonAsset) {
          if (!imagesHandler.edit?.value) throw new Error("Edit handler is not provided");
          const edited = await imagesHandler.edit?.value?.([image]);

          await editImages(edited);
        },
        async upload(files: FileList | null, lastSortOrder?: number) {
          if (!imagesHandler.upload?.value) throw new Error("Upload handler is not provided");
          if (files) {
            const uploaded = await imagesHandler.upload?.value?.(files, lastSortOrder);

            let addToExisting: ICommonAsset[];
            if (Array.isArray(uploaded) && Array.isArray(internalModel.value[props.element.property])) {
              addToExisting = internalModel.value[props.element.property].concat(uploaded);
            } else {
              addToExisting = uploaded;
            }
            files = null;

            await editImages(addToExisting);
          }
        },
        async remove(image: ICommonAsset) {
          if (!imagesHandler.remove?.value) throw new Error("Remove handler is not provided");
          if (
            await showConfirmation(
              computed(() =>
                t(
                  `${props.bladeContext.settings.localizationPrefix
                    .trim()
                    .toUpperCase()}.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION`,
                ),
              ),
            )
          ) {
            const edited = await imagesHandler.remove?.value?.([image]);
            await editImages(edited);
          }
        },
      };

      function onGalleryItemEdit(item: ICommonAsset) {
        openBlade({
          blade: markRaw(AssetsDetails),
          options: {
            asset: item,
            assetEditHandler: imageHandlers.edit,
            assetRemoveHandler: imageHandlers.remove,
          },
        });
      }

      async function editImages(args: ICommonAsset[]) {
        if (props.fieldContext) {
          internalModel.value[props.element.property] = args;
          setModel({
            property: props.element.property,
            value: args,
            context: props.fieldContext,
            scope: props.bladeContext.scope,
          });
          await props.bladeContext.validationState.setFieldValue(props.element.id, args);
        }
      }

      const field = Gallery({
        props: Object.assign(
          {},
          {
            loading: imageHandlers.loading,
            images: toValue(props.baseProps.modelValue),
            multiple: props.element.multiple,
            variant: props.element.variant,
            itemActions: props.element.actions,
            onUpload: imageHandlers.upload,
            onRemove: imageHandlers.remove,
            onEdit: onGalleryItemEdit,
            onSort: editImages,
            hideAfterUpload: props.element.hideAfterUpload,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
      });

      return h(field.component as Component, unrefNested(field.props));
    };
  },
};
