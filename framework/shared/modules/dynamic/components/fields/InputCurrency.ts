import { Component, ExtractPropTypes, h, unref } from "vue";
import { InputCurrency } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { getModel } from "../../helpers/getters";
import { setModel } from "../../helpers/setters";
import { InputCurrencySchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";
import { toValue } from "@vueuse/core";

// TODO fix disabling when blades is disabled
export default {
  name: "InputCurrency",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: InputCurrencySchema }) {
    return () => {
      const field = InputCurrency({
        props: Object.assign(
          {},
          {
            option: toValue(getModel(props.element.optionProperty, props.fieldContext ?? {})),
            optionLabel: props.element.optionLabel,
            optionValue: props.element.optionValue,
            options: unref(props.bladeContext.scope)?.["currencies"],
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
