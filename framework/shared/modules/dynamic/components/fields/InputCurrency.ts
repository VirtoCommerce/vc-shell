import { Component, ExtractPropTypes, h, unref } from "vue";
import { InputCurrency } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { getModel } from "../../helpers/getters";
import { setModel } from "../../helpers/setters";
import { InputCurrencySchema } from "../../types";

// TODO fix disabling when blades is disabled
export default {
  name: "InputCurrency",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: InputCurrencySchema }) {
    return () => {
      const field = InputCurrency({
        props: {
          ...props.baseProps,
          option: getModel(props.element.optionProperty, props.fieldContext ?? {}).value,
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
        options: props.baseOptions,
      });
      const render = h(field.component as Component, field.props);

      if (field.props.rules) {
        return props.baseOptions.visibility
          ? h(
              ValidationField,
              {
                props: field.props,
                index: props.elIndex,
                rows: props.rows,
                key: `${String(field.props.key)}_validation`,
              },
              () => render,
            )
          : null;
      } else {
        return props.baseOptions.visibility ? render : null;
      }
    };
  },
};
