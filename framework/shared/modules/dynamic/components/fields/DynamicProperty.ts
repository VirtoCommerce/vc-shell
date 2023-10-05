/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtractPropTypes, computed, h, inject, ref, toRefs, unref, watch } from "vue";
import { DynamicProperties } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import {
  IProperty,
  IPropertyValue,
  Property,
  PropertyDictionaryItem,
  PropertyValue,
  PropertyValueValueType,
} from "../../../../../core/api/catalog";
import { reactify } from "@vueuse/core";
import { UseDynamicProperties } from "../../factories/base/useDynamicPropertiesFactory";
import * as _ from "lodash-es";
export default {
  name: "DynamicProperty",
  props: componentProps,
  emits: ["setModelData"],
  setup(props: ExtractPropTypes<typeof componentProps>, ctx) {
    const useDynamicProperties = inject<() => UseDynamicProperties<any, any>>("useDynamicProperties");

    let dynamicProperties;
    if (useDynamicProperties && typeof useDynamicProperties === "function") {
      dynamicProperties = useDynamicProperties();
    }

    const { formData } = toRefs(props);

    const internalModel = ref();

    watch(
      formData,
      (newVal) => {
        internalModel.value = _.cloneDeep(newVal);
      },
      { deep: true, immediate: true }
    );

    const filteredProps = reactify((prop: any, { include, exclude }) => {
      if (unref(prop)) {
        return prop.filter((x) => {
          if (include) return include?.includes(x.type);
          if (exclude) return !exclude?.includes(x.type);
          else return true;
        });
      }
      return null;
    });

    const dynamicProps = filteredProps(props.baseProps.modelValue, {
      include: props.element?.include,
      exclude: props.element?.exclude,
    });

    const properties = computed(() => {
      return dynamicProps.value?.map((prop) =>
        DynamicProperties({
          props: {
            disabled: "disabled" in unref(props.scope) && unref(unref(props.scope).disabled),
            property: prop,
            modelValue: computed(() => getPropertyValue(prop, unref(props.currentLocale))),
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
            classNames: "tw-pb-4",
            key: prop.id,
            currentLanguage: props.currentLocale,
          },
          options: props.baseOptions,
        })
      );
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

    async function loadDictionaries(property: Property, keyword?: string, locale?: string) {
      let dictionaryItems = await dynamicProperties?.searchDictionaryItems({
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

      internalModel.value.properties.forEach((prop) => {
        if (prop.id === property.id) {
          prop.values = mutatedProperty;
        }
      });

      ctx.emit("setModelData", internalModel.value);
    }

    return () =>
      properties.value && properties.value.length
        ? properties.value?.map((field) => h(field.component, unrefNested(field.props)))
        : null;
  },
};
