/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtractPropTypes, computed, h, ref, toValue, watch, UnwrapNestedRefs } from "vue";
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
    if (!props.bladeContext.scope.dynamicProperties) {
      throw new Error(
        `There is no DynamicProperties config provided in blade scope: ${JSON.stringify(
          props.bladeContext.scope,
          null,
          2
        )}`
      );
    }

    const internalModel = ref();

    watch(
      () => props.baseProps?.modelValue,
      (newVal) => {
        if (!_.isEqual(newVal, internalModel.value)) {
          internalModel.value = _.cloneDeep(newVal);
        }
      },
      { deep: true, immediate: true }
    );

    const filteredProps = reactify(
      (prop: IProperty[], { include, exclude }: { include: string[]; exclude: string[] }) => {
        if (prop) {
          return prop.filter((x) => {
            if (include) return include?.includes(x.type);
            if (exclude) return !exclude?.includes(x.type);
            else return true;
          });
        }
        return null;
      }
    );

    const dynamicProps = filteredProps(internalModel, {
      include: props.element?.include,
      exclude: props.element?.exclude,
    });

    const properties: UnwrapNestedRefs<IDynamicProperties[]> = reactiveComputed(() => {
      return (dynamicProps.value || [])?.map((prop) =>
        DynamicProperties({
          props: {
            disabled: "disabled" in props.bladeContext.scope && props.bladeContext.scope.disabled,
            property: prop,
            modelValue: computed(() =>
              props.bladeContext.scope.dynamicProperties.getPropertyValue(prop, toValue(props.currentLocale))
            ),
            optionsGetter: props.bladeContext.scope.dynamicProperties.loadDictionaries,
            "onUpdate:model-value": (args: {
              property: Record<string, any>;
              value: string | Record<string, any>[];
              dictionary?: Record<string, any>[];
              locale?: string;
            }) => {
              props.bladeContext.scope.dynamicProperties.setPropertyValue(args);
              setModel({ context: props.fieldContext, property: props.element.property, value: internalModel.value });
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
          options: props.baseOptions,
        })
      );
    });

    return () => {
      return properties && properties.length && props.baseOptions.visibility
        ? properties?.map((field) => h(field.component, unrefNested(field.props)))
        : null;
    };
  },
};
