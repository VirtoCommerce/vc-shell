<template>
  <VcBlade
    v-loading="loading || widgetLoading"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="toolbarComputed"
    :title="bladeTitle"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template
      v-if="bladeOptions?.status"
      #actions
    >
      <component :is="bladeOptions.status" />
    </template>
    <VcContainer :no-padding="true">
      <div
        v-if="isReady"
        class="item-details__inner"
      >
        <div class="item-details__content">
          <VcForm class="tw-grow tw-p-4">
            <create></create>
          </VcForm>
        </div>
        <div
          v-if="bladeWidgets && bladeWidgets.length"
          class="item-details__widgets"
        >
          <div
            v-for="(item, index) in bladeWidgets"
            :key="index"
          >
            <component
              :is="item"
              v-model="context"
            ></component>
          </div>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useI18n } from "vue-i18n";
import {
  ComponentPublicInstance,
  computed,
  ComputedRef,
  h,
  inject,
  markRaw,
  mergeProps,
  nextTick,
  onMounted,
  reactive,
  ref,
  Ref,
  resolveComponent,
  toValue,
  unref,
  VNode,
  VNodeProps,
} from "vue";
import {
  IImage,
  Image,
  IProperty,
  IPropertyValue,
  Property,
  PropertyDictionaryItem,
  PropertyValue,
  PropertyValueValueType,
} from "../../../../core/api/catalog";
import { Field } from "vee-validate";
import {
  Button,
  CardCollection,
  Checkbox,
  DynamicProperties,
  EditorField,
  Fieldset,
  Gallery,
  InputCurrency,
  InputField,
  SelectField,
} from "../components/factories";
import { ControlSchema, DynamicDetailsSchema } from "../types";
import {
  ControlType,
  ControlTypeWithSlots,
  GeneratedModel,
  IControlBaseOptions,
  IControlBaseProps,
  IFieldset,
} from "../components/models";
import { reactify, useArrayFilter } from "@vueuse/core";
import * as _ from "lodash-es";
import { UseDynamicProperties } from "../factories/base/useDynamicPropertiesFactory";
import { UseMultilanguage } from "../factories/base/useMultilanguageFactory";
import { useAssets } from "../../../../core/composables/useAssets";
import { IBladeToolbar } from "../../../../core/types";
import { generateId } from "../../../../core/utilities";

import { AssetsDetails, IParentCallArgs, useBladeNavigation, usePopup } from "../../../index";
import { VcButton, VcCol, VcRow, VcSelect } from "../../../../ui/components";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  model?: DynamicDetailsSchema;
  options?: {
    [x: string]: unknown;
  };
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
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

const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

const isMobile = inject<Ref<boolean>>("isMobile");
const useDynamicProperties = inject<() => UseDynamicProperties<any, any>>("useDynamicProperties");

const useMultilanguage = inject<() => UseMultilanguage>("useMultilanguage");

const { loading, item, validationState, scope, load, remove, saveChanges, bladeTitle } = props.composables[
  props.model?.settings?.composable
]({ emit, props });

const context = reactive({
  loading,
  item,
  validationState,
  scope,
  load,
  remove,
  saveChanges,
  bladeTitle,
});

const isReady = ref(false);

const widgetLoading = ref(false);

const generatedControls = ref<VNode[]>([]);

let languages: string[];
let localesOptions;
const currentLocale = ref("en-US");

const setLocale = (locale: string) => {
  currentLocale.value = locale;
};

const imageHandlers = imageHandler();

const form = computed(() => props.model.content.find((x) => x.type === "form"));

const widgets = computed(() => props.model.content.find((x) => x.type === "widgets"));

const bladeStatus = computed(() => {
  if ("status" in props.model.settings && props.model.settings.status) {
    if (!("component" in props.model.settings.status))
      throw new Error(`Component is required in status: ${props.model.settings.status}`);
    return reactive(h(resolveComponent(props.model.settings.status.component), { context }));
  }

  return null;
});

const bladeMultilanguage = computed(() => {
  if ("multilanguage" in props.model.settings && props.model.settings.multilanguage) {
    return reactive(
      h(VcSelect as any, {
        name: "currentLocale",
        modelValue: currentLocale,
        options: localesOptions,
        optionValue: "value",
        optionLabel: "label",
        disabled: "disabled",
        required: true,
        clearable: false,
        "onUpdate:modelValue": (e: string) => {
          setLocale(e);
        },
      })
    );
  }

  return null;
});

const bladeWidgets = computed(() => {
  return widgets.value?.children?.map((x) => resolveComponent(x));
});

const bladeOptions = reactive({
  status: bladeStatus,
  multilanguage: bladeMultilanguage,
});
function callMethod({ method, arg }) {
  scope[method](arg);
}

const filteredProps = (prop: string, { include, exclude }) => {
  const item: ComputedRef<Property[]> = getModel(prop);

  if (unref(item)) {
    return useArrayFilter(item, (x) => {
      if (include) return include?.includes(x.type);
      if (exclude) return !exclude?.includes(x.type);
      else return true;
    });
  }
  return null;
};

const fieldMap = {
  select: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) =>
    SelectField({
      props: {
        ...baseProps,
        optionValue: element.optionValue,
        optionLabel: element.optionLabel,
        emitValue: true,
        options: scope[element.method],
      },
      options: baseOptions,
      slots: element.customTemplate && {
        "selected-item": (scope) => h(resolveComponent(element.customTemplate.component), { context: scope }),
        option: (scope) => h(resolveComponent(element.customTemplate.component), { context: scope }),
      },
    }),
  input: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) =>
    InputField({
      props: {
        ...baseProps,
        type: element.variant,
      },
      options: baseOptions,
    }),
  "input-currency": (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element, context) => {
    return InputCurrency({
      props: {
        ...baseProps,
        option: getModel(element.optionProperty, context),
        optionLabel: element.optionLabel,
        optionValue: element.optionValue,
        options: scope["currencies"],
        "onUpdate:option": (e) => {
          setModel({ value: e, property: element.optionProperty, context });
        },
      },
      options: baseOptions,
    });
  },
  card: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element, context, helper) =>
    CardCollection({
      props: {
        ...baseProps,
        header: element.label,
        classNames: "tw-my-4",
      },
      options: baseOptions,

      slots: {
        actions: () => {
          const elem = helper(element.action, `${element.id}`);
          return elem;
        },
      },
    }),
  checkbox: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) =>
    Checkbox({
      props: {
        ...baseProps,
        trueValue: element.trueValue,
        falseValue: element.falseValue,
      },
      options: baseOptions,
      slots: {
        default: () => element.content,
      },
    }),
  fieldset: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element, context, helper) => {
    const { modelValue } = baseProps;

    const massFieldSet = computed(() => {
      const createFieldSet = (index: string | number, context?: any) =>
        Fieldset({
          columns: element.columns,
          fields: element.fields.map((child, i) => helper(child, `fieldset-${i}-${index}`, context)),
          property: element.property,
          remove: element.remove,
        });

      if (element.property) {
        return (toValue(modelValue) || [])
          ?.map((i) => toValue(i))
          .map((field, index) => {
            return createFieldSet(index, field);
          });
      }
      return [createFieldSet(element.id)];
    });

    return {
      content: massFieldSet,
    };
  },
  "dynamic-properties": (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) => {
    const dynamicProps = filteredProps(element.property, { include: element?.include, exclude: element?.exclude });

    if (dynamicProps?.value && useDynamicProperties && typeof useDynamicProperties === "function") {
      return {
        content: [
          {
            fields: dynamicProps.value.map((prop) => {
              return DynamicProperties({
                props: {
                  disabled: "disabled" in scope && scope.disabled,
                  property: prop,
                  modelValue: getPropertyValue(prop, currentLocale.value),
                  optionsGetter: loadDictionaries,
                  "onUpdate:model-value": setPropertyValue,
                  required: prop.required,
                  multivalue: prop.multivalue,
                  multilanguage: prop.multilanguage,
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
                },
                options: baseOptions,
              });
            }),
          },
        ],
      };
    }
  },
  button: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) =>
    Button({
      props: {
        ...baseProps,
        small: element.small,
        icon: element?.icon,
        iconSize: element?.iconSize,
        text: element?.text,
        onClick: () => {
          scope[element.method]();
        },
      },
      options: baseOptions,
      slots: {
        default: () => element.content,
      },
    }),
  gallery: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions) =>
    Gallery({
      props: {
        ...baseProps,
        images: baseProps.modelValue,
        multiple: true,
        onUpload: imageHandlers.upload,
        onRemove: imageHandlers.remove,
        onEdit: onGalleryItemEdit,
        onSort: editImages,
      },
      options: baseOptions,
    }),
  editor: (baseProps: IControlBaseProps, baseOptions: IControlBaseOptions, element) =>
    EditorField({
      props: {
        ...baseProps,
        assetsFolder: element.id || element.categoryId,
      },
      options: baseOptions,
    }),
};

function fieldHelper(field: ControlSchema, parentId: string | number, context?: any) {
  if (!field) return false;

  const baseProps: IControlBaseProps = {
    key: `${parentId}-${field.id}`,
    label: field["label"] ? unref(unwrapInterpolation(field["label"], context)) : undefined,
    disabled: ("disabled" in scope && scope.disabled) || disabledHandler("disabled" in field && field.disabled),
    name: field["name"],
    rules: field["rules"],
    placeholder: field["label"],
    required: field["rules"]?.required,
    classNames: "tw-p-2",
    modelValue: getModel(field["property"], context),
    "onUpdate:modelValue": (e) => setModel({ property: field["property"], value: e, context }),
    tooltip: field["tooltip"],
  };

  const baseOptions = {
    visibility: field["visibility"]?.method ? toValue(scope[field["visibility"]?.method]) : true,
  };

  return {
    ...fieldMap[field.type](baseProps, baseOptions, field, context, fieldHelper),
    id: parentId,
    children: (field["children"] || []).map((child, i) => fieldHelper(child, `${parentId}-${i}`, context)),
  };
}

function unrefNested<T>(field: T) {
  const unreffedProps = {} as T;

  if (field) {
    Object.keys(field).forEach((key) => {
      unreffedProps[key] = unref(field[key]);
    });

    return unreffedProps;
  }
  return field;
}

function fieldValidation(args: {
  component: ControlType["component"];
  props: ControlType["props"];
  slots: ControlTypeWithSlots["slots"];
  options: ControlType["options"];
  rows?: number;
}) {
  const { component, props, slots, options, rows } = unrefNested(args);
  if (!(options && "visibility" in options && options.visibility)) return h("div");
  return h(
    Field,
    {
      name: rows > 1 ? unref(props)?.name + generateId() : unref(props)?.name,
      rules: unref(props).rules,
      modelValue: unref(props.modelValue),
      label: unref(props).label,
    },
    {
      default: ({ errorMessage, errors, handleChange }) =>
        h(
          component as unknown as ComponentPublicInstance,
          {
            ...mergeProps(unrefNested(props) as VNodeProps, {
              "onUpdate:modelValue": (e) => {
                handleChange(e);
              },
            }),
            error: !!errors.length,
            errorMessage,
            class: props.classNames,
          },
          { ...slots }
        ),
    }
  );
}

function fieldNoValidation(args: {
  component: ControlType["component"];
  props: ControlType["props"];
  slots: ControlTypeWithSlots["slots"];
  options: ControlType["options"];
}) {
  const { component, props, slots, options } = unrefNested(args);
  if (!(options && "visibility" in options && options.visibility)) return h("div");
  return h(component as any, { ...unrefNested(props), class: props?.classNames }, slots);
}

function renderFieldset(args: { content: IFieldset[] }) {
  const { content } = unrefNested(args);

  const unreffed = unref(content);

  return unreffed.map(({ columns, fields, remove }, index, arr) => {
    const divideByCols = _.chunk(Object.values(fields), columns || 1);

    return h(
      "div",
      divideByCols.map((itemsArr, colIndex) => {
        return h(
          VcRow,
          {
            key: `col-${colIndex}-${index}`,
            class: {
              "tw-relative": true,
            },
          },
          () => [
            ...itemsArr.map((item, itemIndex) => {
              return h(VcCol, { key: `item-${itemIndex}-${colIndex}-${index}` }, () =>
                helperCreateComponent({ ...(item as any), rows: unreffed.length })
              );
            }),
            unref(remove)
              ? h(VcButton, {
                  iconSize: "m",
                  icon: "fas fa-times-circle",
                  text: true,
                  class: {
                    "tw-m-2": true,
                    "tw-absolute tw-top-0 tw-right-0": isMobile.value,
                    "!tw-hidden": arr.length === 1,
                  },
                  onClick: () => callMethod({ method: unref(remove)?.method, arg: index }),
                })
              : undefined,
          ]
        );
      })
    );
  });
}

function renderCard(args: { component; props; slots; children; options }) {
  const { component, props, slots, children } = unrefNested(args);

  const { header, classNames, key } = props;

  return h(
    component,
    { header, class: classNames, key },
    {
      default: () => h("div", { class: { "tw-p-2": true, ...props.classNames } }, children.map(helperCreateComponent)),
      actions: () => {
        const elem = slots?.actions();
        if (elem) {
          return helperCreateComponent(elem);
        }
        return undefined;
      },
    }
  );
}

function fieldHelperCreateField(field: GeneratedModel) {
  const { component, props, children = [], content = [], slots = undefined, options = {} } = field;

  return helperCreateComponent({ component, props, children, content, slots, options });
}

function getFields(children: GeneratedModel[] = []): VNode[] {
  return children.reduce((children, field): VNode[] => [...children, fieldHelperCreateField(field)], []);
}

function buildForm(items: ControlSchema[]) {
  const createdModel: GeneratedModel[] = items.reduce((arr, field, index) => [...arr, fieldHelper(field, index)], []);
  const createdUi = getFields(createdModel);
  generatedControls.value = createdUi;
}

function helperCreateComponent({
  component,
  props,
  children,
  content,
  slots,
  rows,
  options,
}: {
  component: GeneratedModel["component"];
  props: GeneratedModel["props"];
  children?: GeneratedModel["children"];
  content?: GeneratedModel["content"];
  slots: ControlTypeWithSlots["slots"];
  rows?: number;
  options: GeneratedModel["options"];
}) {
  const rules = _.get(props, "rules");
  const noValidation = _.get(options, "noValidation");
  const isRulesExist = rules && Object.keys(rules).length;

  if (content && unref(content) && unref(content).length) {
    return renderFieldset({ content });
  }

  if (children && children.length) {
    return renderCard({ component, props, slots, children, options });
  }

  if (!noValidation && isRulesExist) {
    return fieldValidation({ component, props, slots, rows, options });
  }

  if (!isRulesExist || noValidation) {
    return fieldNoValidation({ component, props, slots, options });
  }
}

function create() {
  return h("div", generatedControls.value);
}

function unwrapInterpolation(property: string, context: typeof item.value) {
  const pattern = /{(.*)}/g;

  const match = property.match(pattern);

  if (match) {
    return getModel(property.replace(/{|}/g, ""), context);
  }

  return property;
}

const toolbarMethods = ref(
  _.merge(
    {},
    {
      saveChanges: {
        async clickHandler() {
          await saveChanges(item.value);

          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("close:blade");
          }
        },
        disabled: computed(() => !validationState.value.validated),
      },
      remove: {
        async clickHandler() {
          if (await showConfirmation(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_PRODUCT")))) {
            await remove({ id: props.param });
            emit("parent:call", {
              method: "reload",
            });
            emit("close:blade");
          }
        },
        // disabled: computed(() => disabled.value),
      },
    },
    scope
  )
);

const toolbarComputed = computed((): IBladeToolbar[] => {
  return props.model.settings.toolbar.reduce((acc, curr) => {
    const toolbarItemCtx = toolbarMethods.value[curr.method];

    if (toolbarItemCtx) {
      const context =
        typeof toolbarItemCtx === "function"
          ? { clickHandler: async () => await toolbarItemCtx() }
          : { ...toolbarItemCtx };

      acc.push({
        ...curr,
        ...context,
      });
    }

    return acc;
  }, []);
});

onMounted(async () => {
  if (useMultilanguage && typeof useMultilanguage === "function") {
    languages = await useMultilanguage().getLanguages();
    localesOptions = languages.map((x) => ({ label: t(`OFFERS.PAGES.DETAILS.LANGUAGES.${x}`, x), value: x }));
  }

  if (props.param) {
    await load({ id: props.param });

    if (widgets.value) {
      // await createWidgets();
    }
  }

  buildForm(form.value.children as ControlSchema[]);

  nextTick(() => {
    isReady.value = true;
  });
});

function getPropertyValue(property: Property, locale: string) {
  if (property.multilanguage) {
    if (property.multivalue) {
      return property.values.filter((x) => x.languageCode == locale);
    } else if (property.values.find((x) => x.languageCode == locale) == undefined) {
      property.values.push(
        new PropertyValue({
          propertyName: property.name,
          propertyId: property.id,
          languageCode: locale,
          valueType: property.valueType as unknown as PropertyValueValueType,
        })
      );
    }

    if (property.dictionary) {
      return (
        property.values.find((x) => x.languageCode == locale) &&
        property.values.find((x) => x.languageCode == locale).valueId
      );
    }
    return property.values.find((x) => x.languageCode == locale).value;
  } else {
    if (property.multivalue) {
      return property.values;
    }
    if (property.dictionary) {
      return property.values[0] && property.values[0].valueId;
    }
    return property.values[0] && property.values[0].value;
  }
}

function handleDictionaryValue(
  property: IProperty,
  valueId: string,
  dictionary: PropertyDictionaryItem[],
  locale?: string
) {
  let valueValue;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (!dictionaryItem) {
    return undefined;
  }

  if (dictionaryItem["value"]) {
    valueValue = dictionaryItem["value"];
  } else {
    valueValue = dictionaryItem.alias;
  }

  return {
    propertyId: dictionaryItem.propertyId,
    alias: dictionaryItem.alias,
    languageCode: locale,
    value: valueValue,
    valueId: valueId,
  };
}

async function loadDictionaries(property: Property, keyword?: string, locale?: string) {
  let dictionaryItems = await useDynamicProperties().searchDictionaryItems({
    propertyIds: [property.id],
    keyword,
    skip: 0,
  });
  if (locale) {
    dictionaryItems = dictionaryItems.map((x) =>
      Object.assign(x, { value: x.localizedValues.find((v) => v.languageCode == locale)?.value ?? x.alias })
    );
  }
  return dictionaryItems;
}

function disabledHandler(disabled: { method?: string; inverted?: boolean } | boolean) {
  if (!disabled) return false;
  if (typeof disabled === "boolean") {
    return disabled;
  } else if (typeof scope[disabled.method] === "function") {
    return scope[disabled.method]();
  }
}

function setPropertyValue(data: {
  property: Property;
  value: string | IPropertyValue[];
  dictionary?: PropertyDictionaryItem[];
  locale?: string;
}) {
  const { property, value, dictionary, locale } = data;

  let mutatedProperty: PropertyValue[];
  if (dictionary && dictionary.length) {
    if (property.multilanguage) {
      if (Array.isArray(value)) {
        mutatedProperty = value.map((item) => {
          if (dictionary.find((x) => x.id === item.valueId)) {
            return new PropertyValue(handleDictionaryValue(property, item.valueId, dictionary, locale));
          } else {
            return new PropertyValue(item);
          }
        });
      } else {
        mutatedProperty = [new PropertyValue(handleDictionaryValue(property, value, dictionary, locale))];
      }
    } else {
      mutatedProperty = Array.isArray(value)
        ? value.map((item) => {
            if (dictionary.find((x) => x.id === item.id)) {
              const handledValue = handleDictionaryValue(property, item.id, dictionary);
              return new PropertyValue(handledValue);
            } else return new PropertyValue(item);
          })
        : [new PropertyValue(handleDictionaryValue(property, value, dictionary))];
    }
  } else {
    if (property.multilanguage) {
      if (Array.isArray(value)) {
        mutatedProperty = [
          ...property.values.filter((x) => x.languageCode !== locale),
          ...value.map((item) => new PropertyValue(item)),
        ];
      } else {
        if (property.values.find((x) => x.languageCode == locale)) {
          property.values.find((x) => x.languageCode == locale).value = value;
          mutatedProperty = property.values;
        } else {
          mutatedProperty = [new PropertyValue({ value: value, isInherited: false, languageCode: locale })];
        }
      }
    } else {
      mutatedProperty = Array.isArray(value)
        ? value.map((item) => new PropertyValue(item))
        : property.values[0]
        ? [Object.assign(property.values[0], { value: value })]
        : [new PropertyValue({ value: value, isInherited: false })];
    }
  }

  item.value.properties.forEach((prop) => {
    if (prop.id === property.id) {
      prop.values = mutatedProperty;
    }
  });
}

const getModel = reactify((property: string, context = item.value) => {
  if (property && unref(context)) {
    return _.get(unref(context), property);
  }
  return null;
});

function setModel(args: {
  property: string;
  value: string | number | Record<string, unknown>;
  option?: string;
  context: unknown;
}) {
  const { property, value, option, context = item.value } = args;

  context[property] = option ? value[option] : value;
}

function imageHandler() {
  const { edit, remove, upload, loading } = useAssets(Image);
  return {
    loading: computed(() => loading.value),

    edit(image: IImage) {
      item.value.images = edit(item.value.images, image);
    },
    async upload(files: FileList) {
      item.value.images = await upload(files, item.value.images, item.value.id || item.value.categoryId);

      files = null;

      return item.value.images;
    },
    async remove(image: IImage) {
      if (await showConfirmation(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION")))) {
        item.value.images = await remove(item.value.images, image);
      }
      return item.value.images;
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

function editImages(args: Image[]) {
  item.value.images = args;
}

async function onBeforeClose() {
  if (validationState.value.modified) {
    return await showConfirmation(unref(computed(() => t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

defineExpose({
  title: bladeTitle,
  onBeforeClose,
});
</script>

<style lang="scss">
.item-details {
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
