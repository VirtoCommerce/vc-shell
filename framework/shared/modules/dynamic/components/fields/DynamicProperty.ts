/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtractPropTypes, computed, h, ref, toValue, watch, UnwrapNestedRefs, Component } from "vue";
import { DynamicProperties } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import { reactify, reactiveComputed } from "@vueuse/core";
import * as _ from "lodash-es";
import { DynamicPropertiesSchema } from "../../types";
import { setModel } from "../../helpers/setters";
import { IDynamicProperties } from "../../types/models";

interface IProperty {
  [x: string]: unknown;
  type: string;
  required: boolean;
  multivalue?: boolean;
  multilanguage?: boolean;
  valueType: string;
  dictionary?: boolean;
  name: string;
  displayNames: { name?: string; languageCode?: string }[];
  validationRule?: {
    charCountMin: number;
    charCountMax: number;
    regExp: string;
  };
}

export default {
  name: "DynamicProperty",
  props: componentProps,
  emits: ["setModelData"],
  setup(props: ExtractPropTypes<typeof componentProps> & { element: DynamicPropertiesSchema }) {
    if (!props.bladeContext.scope?.dynamicProperties) {
      throw new Error(
        `There is no DynamicProperties config provided in blade scope: ${JSON.stringify(
          props.bladeContext.scope,
          null,
          2,
        )}`,
      );
    }

    const internalModel = ref();

    watch(
      () => props.baseProps?.modelValue,
      (newVal) => {
        if (!_.isEqual(toValue(newVal), internalModel.value)) {
          internalModel.value = _.cloneDeep(toValue(newVal));
        }
      },
      { deep: true, immediate: true },
    );

    const filteredProps = reactify(
      (prop: IProperty[], { include, exclude }: { include?: string[]; exclude?: string[] }) => {
        if (prop) {
          return prop.filter((x) => {
            if (include) return include?.includes(x.type);
            if (exclude) return !exclude?.includes(x.type);
            else return true;
          });
        }
        return null;
      },
    );

    const dynamicProps = filteredProps(internalModel, {
      include: props.element?.include,
      exclude: props.element?.exclude,
    });

    const initialProps = _.cloneDeep(dynamicProps.value);

    const properties: UnwrapNestedRefs<IDynamicProperties[]> = reactiveComputed(() => {
      console.log("props.bladeContext.scope?.dynamicProperties: ", props.bladeContext.scope?.dynamicProperties);
      console.log("dynamicProps.value: ", dynamicProps.value);
      return (dynamicProps.value || [])?.map((prop) =>
        DynamicProperties({
          props: {
            disabled:
              props.bladeContext.scope && "disabled" in props.bladeContext.scope && props.bladeContext.scope.disabled,
            property: prop,
            modelValue: computed(() =>
              props.bladeContext.scope?.dynamicProperties?.getPropertyValue(
                prop,
                toValue(props.currentLocale ?? "en-US"),
              ),
            ),
            optionsGetter: props.bladeContext.scope?.dynamicProperties?.loadDictionaries as (
              propertyId: string,
              keyword?: string | undefined,
              locale?: string | undefined,
            ) => Promise<Record<string, any>[]>,
            measurementsGetter: props.bladeContext.scope?.dynamicProperties?.loadMeasurements as (
              measureId: string,
              locale?: string | undefined,
            ) => Promise<Record<string, any>[]>,
            "onUpdate:model-value": (args: {
              value: string | Record<string, any>[];
              dictionary?: Record<string, any>[];
              locale?: string;
            }) => {
              props.bladeContext.scope?.dynamicProperties?.setPropertyValue({
                property: prop,
                value: args.value,
                dictionary: args.dictionary,
                locale: args.locale,
                initialProp: _.cloneDeep(initialProps?.find((x) => x.id === prop.id)),
              });
              if (props.fieldContext) {
                setModel({ context: props.fieldContext, property: props.element.property, value: internalModel.value });
              }
            },
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
            key: prop.multilanguage ? prop.name + "_" + prop.id + "_" + props.currentLocale : prop.name + "_" + prop.id,
            currentLanguage: props.currentLocale,
          },
        }),
      );
    });

    return () => {
      return properties && properties.length
        ? properties.map((field) =>
            h(field.component as Component, {
              ...unrefNested(field.props),
              class: unrefNested(props.baseProps).classNames ?? "",
              key: field.props.key,
            }),
          )
        : null;
    };
  },
};
