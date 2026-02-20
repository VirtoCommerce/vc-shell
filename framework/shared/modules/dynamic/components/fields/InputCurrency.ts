import { Component, ExtractPropTypes, h, unref } from "vue";
import { InputCurrency } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import ValidationField from "@shared/modules/dynamic/components/fields/ValidationField";
import { getModel } from "@shared/modules/dynamic/helpers/getters";
import { setModel } from "@shared/modules/dynamic/helpers/setters";
import { InputCurrencySchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";
import { toValue } from "@vueuse/core";
import { safeIn } from "@shared/modules/dynamic/helpers/safeIn";

export default {
  name: "InputCurrency",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: InputCurrencySchema }) {
    return () => {
      const options =
        (safeIn("options", props.element) &&
          props.element.options &&
          (toValue(getModel(props.element.options, props.fieldContext ?? {})) ||
            toValue(unref(props.bladeContext.scope)?.[props.element.options]))) ??
        undefined;

      const contextProperty =
        safeIn("optionProperty", props.element) &&
        props.element.optionProperty &&
        getModel(props.element.optionProperty, props.fieldContext ?? {});

      const scopedProperty =
        safeIn("optionProperty", props.element) &&
        props.element.optionProperty &&
        props.bladeContext.scope &&
        getModel(props.element.optionProperty, props.bladeContext.scope);

      const field = InputCurrency({
        props: Object.assign(
          {},
          {
            precision: props.element.precision,
            option: toValue(scopedProperty ?? contextProperty),
            currencyDisplay: props.element.currencyDisplay,
            optionLabel: props.element.optionLabel,
            optionValue: props.element.optionValue,
            options,
            "onUpdate:option": (e: string | number | Record<string, unknown>) => {
              setModel({
                value: e,
                property: props.element.optionProperty,
                context: props.fieldContext ?? {},
                scope: props.bladeContext.scope,
              });
            },
            clearable: props.element.clearable || false,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
      });
      const render = h(field.component as Component, field.props);

      if (field.props.rules) {
        return h(
          ValidationField,
          {
            props: field.props,
            index: props.elIndex,
            rows: props.rows,
            key: `${String(field.props.key)}_validation`,
          },
          () => render,
        );
      } else {
        return render;
      }
    };
  },
};
