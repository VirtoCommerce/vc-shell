<template>
  <VcBlade
    v-loading="loading || widgetLoading"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="toolbarComputed"
    :title="model?.settings?.titleTemplate"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="true">
      <div
        v-if="!loading && isReady"
        class="bladeData-details__inner"
      >
        <div class="bladeData-details__content">
          <VcForm class="tw-grow tw-p-4">
            <VcDynamic
              :form="normalizedForm"
              @set="setter"
              @call:method="callMethod"
            ></VcDynamic>
          </VcForm>
        </div>
        <div
          v-if="widgets"
          class="bladeData-details__widgets"
        >
          <VcWidget
            v-for="(widget, i) in my"
            :key="`${widget}_${i}`"
            :icon="widget.icon"
            :title="widget.title"
            :value="widget.value"
            :disabled="disabled"
            @click="widgetClickHandler(widget)"
          >
          </VcWidget>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import {
  AssetsDetails,
  IBladeToolbar,
  IParentCallArgs,
  useAssets,
  useBladeNavigation,
  usePopup,
  camelize,
  generateId,
  VcImage,
  VcHint,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { ComputedRef, computed, h, markRaw, nextTick, onMounted, reactive, ref, unref } from "vue";
import {
  Asset,
  Image,
  IAsset,
  IImage,
  Property,
  IPropertyValue,
  PropertyDictionaryItem,
  PropertyValue,
  IProperty,
} from "../../../api_client/marketplacevendor";
import { useDynamicForm } from "../composables";
import { useIsFormValid, useForm, useIsFormDirty } from "vee-validate";
import { useOffers } from "../../../modules/offers";
import VcDynamic from "../../../dynamic/components/vc-dynamic.vue";
import {
  InputField,
  SelectField,
  CardCollection,
  DynamicProperties,
  EditorField,
  Gallery,
  Checkbox,
  Button,
  InputCurrency,
  Fieldset,
} from "../../../dynamic/components/factories";
import { DynamicData, DetailsContent } from "../types";
import { FormFields, IControlBase } from "./../../../dynamic/components/models";
import { useMarketplaceSettings } from "../../../modules/settings";
import { reactify, useArrayFilter, useArrayMap } from "@vueuse/core";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  model: DynamicData;
}

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { searchOffers } = useOffers();
const { setFieldError } = useForm({
  validateOnMount: false,
});

const {
  bladeData,
  loading,
  bladeDataDetails,
  modified,
  disabled,
  assets,
  images,
  loadBladeData,
  loadAdditionalData,
  updateDetails,
  createItem,
  deleteItem,
  getPropDictionaries,
  scopedModuleFunction,
  runMountedHook,
} = useDynamicForm(props.model.settings.composable);
const scopedFunctions = scopedModuleFunction();

useForm({ validateOnMount: false });

const isReady = ref(false);
const isValid = useIsFormValid();
const { currencies, loadSettings } = useMarketplaceSettings();
const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();

const widgetLoading = ref(false);

const assetHandlers = assetsHandler();
const imageHandlers = imageHandler();

const isDisabled = computed(() => {
  return !isDirty.value || !isFormValid.value;
});

const form = computed(() => props.model.content.find((x) => x.type === "form"));

const widgets = computed(() => props.model.content.find((x) => x.type === "widgets"));

const normalizedForm = ref<FormFields>();

function callMethod({ method, arg }) {
  scopedFunctions[method](arg);
}

const filteredProps = (prop: string, { include, exclude }) => {
  const item: ComputedRef<Property[]> = getter(prop);

  if (unref(item)) {
    return useArrayFilter(item, (x) => {
      if (include) return include?.includes(x.type);
      if (exclude) return !exclude?.includes(x.type);
      else return true;
    });
  }
  return null;
};

function createSelectTemplate(scope, moreInfo?: string) {
  return h("div", { class: "tw-flex tw-items-center tw-py-2 tw-truncate" }, [
    h(VcImage, {
      class: "tw-shrink-0",
      size: "xs",
      src: scope.opt.imgSrc,
      bordered: true,
      background: "contain",
    }),
    h("div", { class: "tw-grow tw-basis-0 tw-ml-4 tw-truncate" }, [
      h("div", { class: "tw-truncate" }, scope.opt.name),
      h(VcHint, { class: "tw-truncate tw-mt-1" }, () => t("OFFERS.PAGES.DETAILS.FIELDS.CODE") + " " + scope.opt.sku),
      moreInfo
        ? h("div", { class: "vc-link tw-mt-1", onClick: (e) => test(e, moreInfo) }, t("OFFERS.PAGES.DETAILS.MORE_INFO"))
        : undefined,
    ]),
  ]);
}

function test(e, bladeName: string) {
  e.stopPropagation();

  console.log(bladeName);

  const blade = resolveBladeByName(bladeName);

  console.log(blade);

  if (blade) {
    openBlade({
      blade,
    });
  }
}

function normalize(items: DetailsContent[], context?: unknown) {
  if (!(items && items.length) || items.some((x) => x === undefined))
    throw new Error("No items or its children provided");
  const normalizedControls: FormFields = {};

  for (let index = 0; index < items.length; index++) {
    const element = items[index];

    const baseProps: IControlBase = {
      label: element.label ? unwrapInterpolation(element?.label, context) : undefined,
      disabled: disabled.value,
      name: element?.name,
      rules: element.rules,
      placeholder: element?.label,
      required: element.rules?.required,
      context: context,
      classNames: "tw-p-2",
      modelValue: getter(element.property, context),
      rawProperty: element.property,
    };

    if (element.type === "select") {
      normalizedControls[element.property + "_" + generateId()] = SelectField({
        ...baseProps,
        optionValue: element.optionValue,
        optionLabel: element.optionLabel,
        emitValue: true,
        options: loadAdditionalData,
        slots: {
          "selected-item": (scope) => createSelectTemplate(scope, element.moreInfo),
          option: (scope) => createSelectTemplate(scope),
        },
      });
    }
    if (element.type === "input") {
      normalizedControls[element.property + "_" + generateId()] = InputField({
        ...baseProps,
        disabled: disabled.value || disabledHandler(element?.disabled),

        type: element.variant,
      });
    }
    if (element.type === "input-currency") {
      normalizedControls[element.property + "_" + generateId()] = InputCurrency({
        ...baseProps,
        option: getter(element.optionProperty, context),
        optionLabel: element.optionLabel,
        optionValue: element.optionValue,
        options: unref(currencies),
        "onUpdate:option": (e) => {
          setter({ value: e, property: element.optionProperty, context });
        },
      });
    }
    if (element.type === "card") {
      normalizedControls[`collection_${camelize(element.label)}` + "_" + generateId()] = CardCollection({
        ...baseProps,
        children: normalize(element.children),
        title: element.label,
        classNames: "tw-my-4",
        slots: {
          actions: () => {
            const elem = element.actions && element.actions.length && normalize(element.actions);
            return elem;
          },
        },
      });
    }
    if (element.type === "dynamic-properties") {
      const dynamicProps = filteredProps(element.property, { include: element?.include, exclude: element?.exclude });

      if (dynamicProps)
        dynamicProps.value.forEach((prop) => {
          normalizedControls["dynamic" + "_" + generateId()] = DynamicProperties({
            property: prop,
            modelValue: getPropertyValue(prop),
            optionsGetter: getPropDictionaries,
            "onUpdate:model-value": setPropertyValue,
            required: prop.required,
            multivalue: prop.multivalue,
            valueType: prop.valueType,
            dictionary: prop.dictionary,
            name: prop.name,
            rules: {
              min: prop.validationRule?.charCountMin,
              max: prop.validationRule?.charCountMax,
              regex: prop.validationRule?.regExp,
            },
            displayNames: prop.displayNames,
            classNames: "tw-p-2",
          });
        });
    }
    if (element.type === "editor") {
      normalizedControls[element.property + "_" + generateId()] = EditorField({
        ...baseProps,
        assetsFolder: bladeData.value?.id || bladeData.value?.categoryId,
      });
    }
    if (element.type === "gallery") {
      normalizedControls[element.property + "_" + generateId()] = Gallery({
        ...baseProps,
        images: getter(element.property),
        multiple: true,
        onUpload: imageHandlers.upload,
        onRemove: imageHandlers.remove,
        onEdit: onGalleryItemEdit,
        onSort: editImages,
      });
    }
    if (element.type === "checkbox") {
      normalizedControls[element.property + "_" + generateId()] = Checkbox({
        ...baseProps,
        trueValue: element.trueValue,
        falseValue: element.falseValue,
        slots: {
          default: () => element.content,
        },
      });
    }
    if (element.type === "button") {
      normalizedControls["button" + "_" + generateId()] = Button({
        small: element.small,
        icon: element?.icon,
        iconSize: element?.iconSize,
        text: element?.text,
        name: element?.name,
        onClick: () => {
          scopedFunctions[element.method]();
        },
        slots: {
          default: () => element.content,
        },
      });
    }
    if (element.type === "fieldset") {
      const p = getter(element?.property);

      normalizedControls["fieldset" + "_" + generateId()] = Fieldset({
        content: useArrayMap(Array.isArray(unref(p)) ? p : [p], (prop) => ({
          columns: element.columns,
          property: element.property,
          fields: normalize(element.fields, prop),
          remove: element.remove,
        })),
      });
    }
  }

  return normalizedControls;
}

function unwrapInterpolation(property: string, context) {
  const pattern = /{(.*)}/g;

  const match = property.match(pattern);

  if (match) {
    const prop = unref(getter(property.replace(/{|}/g, ""), context));
    return prop;
  }

  return property;
}

const toolbarDefaults = ref<IBladeToolbar[]>([
  {
    id: "save",
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        if (props.param) {
          await updateDetails(bladeDataDetails.value, bladeData.value.id);
        } else {
          await createItem(bladeDataDetails.value);
        }

        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      }
    },
    disabled: computed(() => !modified.value || !isValid.value),
  },
  {
    id: "delete",
    icon: "fas fa-trash",
    async clickHandler() {
      if (await showConfirmation(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_PRODUCT")))) {
        await deleteItem(props.param);
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      }
    },
    disabled: computed(() => disabled.value),
  },
]);

const toolbarOptions = ref<IBladeToolbar[]>([]);

onMounted(async () => {
  await loadSettings();

  if (props.param) {
    await loadBladeData(props.param);

    // normalizedForm.value = normalize(form.value.children);

    if (widgets.value) {
      await createWidgets();
    }
  } else {
    runMountedHook();
  }

  normalizedForm.value = normalize(form.value.children);

  nextTick(() => {
    isReady.value = true;
  });
});

const toolbarComputed = computed((): IBladeToolbar[] => {
  if (props.model.settings.toolbar) {
    const optional = props.model.settings.toolbar
      ?.map((item) => {
        const tool = toolbarOptions.value.find((x) => x.id === item.id);
        if (tool) {
          return {
            ...tool,
            title: item.title,
          };
        }
      })
      .filter((x) => x);

    return toolbarDefaults.value.concat(optional);
  }
  return toolbarDefaults.value;
});

function getPropertyValue(property: Property) {
  if (property.multivalue) {
    return property.values;
  }
  if (property.dictionary) {
    return property.values[0] && property.values[0].valueId;
  }
  return property.values[0] && property.values[0].value;
}

function handleDictionaryValue(property: IProperty, valueId: string, dictionary: PropertyDictionaryItem[]) {
  let valueName;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (dictionaryItem) {
    valueName = dictionaryItem.alias;
  } else {
    valueName = property.name;
  }

  return {
    value: valueName,
    valueId,
  };
}

function disabledHandler(disabled: { method?: string; inverted?: boolean } | boolean) {
  if (disabled === undefined) return false;
  if (typeof disabled === "boolean") {
    return disabled;
  }
  return scopedFunctions[disabled.method]();
}

function setPropertyValue(data: {
  property: Property;
  value: string | IPropertyValue[];
  dictionary?: PropertyDictionaryItem[];
}) {
  const { property, value, dictionary } = data;

  let mutatedProperty: PropertyValue[];
  if (dictionary && dictionary.length) {
    mutatedProperty = Array.isArray(value)
      ? value.map((item) => {
          if (dictionary.find((x) => x.id === item.id)) {
            const handledValue = handleDictionaryValue(property, item.id, dictionary);

            return new PropertyValue(handledValue);
          } else return new PropertyValue(item);
        })
      : [new PropertyValue(handleDictionaryValue(property, value, dictionary))];
  } else {
    mutatedProperty = Array.isArray(value)
      ? value.map((item) => new PropertyValue(item))
      : property.values[0]
      ? [Object.assign(property.values[0], { value: value })]
      : [new PropertyValue({ value: value, isInherited: false })];
  }

  bladeDataDetails.value.properties.forEach((prop) => {
    if (prop.id === property.id) {
      prop.values = mutatedProperty;
    }
  });
}

const getter = reactify((property: string, context = bladeDataDetails.value) => {
  if (property && context) {
    return property.split(".").reduce((p: unknown, c: string) => {
      if (p && Array.isArray(p) && p.length) {
        return p && p[0][c];
      }
      return p && p[c];
    }, context);
  }
});

function setter(args: {
  property: string;
  value: string | number | Record<string, unknown>;
  option?: string;
  context: unknown;
}) {
  const { property, value, option, context = bladeDataDetails.value } = args;

  console.log(args);

  context[property] = option ? value[option] : value;
}

const widgetsOptions = reactive({
  OffersList: {
    get count() {
      return async () => {
        if (props.param) {
          const count = (
            await searchOffers({
              take: 0,
              sellerProductId: props.param,
            })
          )?.totalCount;
          return count;
        }
      };
    },
    options: {
      sellerProduct: bladeData.value,
    },
  },
  AssetsManager: {
    count: computed(() => (bladeDataDetails.value && bladeDataDetails.value?.assets?.length) || 0),
    options: {
      assets: assets,
      assetsEditHandler: assetHandlers.edit,
      assetsUploadHandler: assetHandlers.upload,
      assetsRemoveHandler: assetHandlers.remove,
    },
  },
});

function widgetClickHandler(args: { navigate: string }) {
  if (args.navigate) {
    const blade = resolveBladeByName(args.navigate);
    const bladeData = widgetsOptions[args.navigate].options;
    if (blade) {
      openBlade({
        blade: markRaw(blade),
        options: {
          ...bladeData,
        },
      });
    }
  }
}

const my = ref([]);
async function createWidgets() {
  try {
    widgetLoading.value = true;
    const selected = widgets.value.children;

    for (let index = 0; index < selected.length; index++) {
      let count;
      const widget = widgetsOptions[selected[index]["navigate"]];
      if (widget) {
        if (widget.count && typeof widget.count === "function") {
          count = await widget.count();
        } else {
          count = widget.count;
        }
      }

      my.value.push({
        value: count,
        icon: selected[index]["icon"],
        title: selected[index]["label"],
        navigate: selected[index]["navigate"],
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    widgetLoading.value = false;
  }
}

function assetsHandler() {
  const { editBulk, upload, removeBulk, loading } = useAssets(Asset);
  return {
    loading: computed(() => loading.value),
    edit(assetsArr: IAsset[]) {
      assets.value = editBulk(assetsArr);
      return bladeDataDetails.value.assets;
    },
    async upload(files: FileList) {
      assets.value = await upload(files, assets.value, bladeData.value.id || bladeData.value.categoryId);
      files = null;

      return assets.value;
    },
    async remove(assetsArr: Asset[]) {
      if (
        await showConfirmation(
          computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION_ASSET", { count: assetsArr.length }))
        )
      ) {
        assets.value = await removeBulk(assets.value, assetsArr);
      }
      return bladeDataDetails.value.assets;
    },
  };
}

function imageHandler() {
  const { edit, remove, upload, loading } = useAssets(Image);
  return {
    loading: computed(() => loading.value),

    edit(image: IImage) {
      images.value = edit(images.value, image);
    },
    async upload(files: FileList) {
      images.value = await upload(
        files,
        bladeDataDetails.value.images,
        bladeData.value.id || bladeData.value.categoryId
      );

      files = null;

      return images.value;
    },
    async remove(image: IImage) {
      if (await showConfirmation(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION")))) {
        images.value = await remove(images.value, image);
      }
      return images.value;
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

const editImages = (args: Image[]) => {
  bladeDataDetails.value.images = args;
};
</script>

<style lang="scss">
.bladeData-details {
  &__inner {
    @apply tw-overflow-hidden tw-min-h-full tw-flex tw-grow tw-basis-0;
  }

  &__content {
    @apply tw-border-r tw-border-solid tw-border-r-[#eaedf3] tw-overflow-hidden tw-grow tw-basis-0;
  }

  &__decline-icon {
    @apply tw-text-[#ff4a4a] tw-mr-3;
  }

  .app_phone &__inner {
    @apply tw-flex-col;
  }

  .app_phone &__content {
    @apply tw-border-r-0 tw-border-b tw-border-solid tw-border-b-[#eaedf3] tw-overflow-visible;
  }

  .app_phone &__widgets {
    @apply tw-flex tw-flex-row;
  }
}
</style>
