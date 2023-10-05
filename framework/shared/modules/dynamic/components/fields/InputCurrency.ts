import { reactiveComputed } from "@vueuse/core";
import { getCurrentInstance, h, unref } from "vue";
import { InputCurrency } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import ValidationField from "./ValidationField";

export default {
  name: "InputCurrency",
  props: componentProps,
  setup(props) {
    const field = reactiveComputed(() =>
      InputCurrency({
        props: {
          ...props.baseProps,
          option: props.getModel(props.element.optionProperty, props.fieldContext),
          optionLabel: props.element.optionLabel,
          optionValue: props.element.optionValue,
          options: unref(props.scope)["currencies"],
          "onUpdate:option": (e: any) => {
            props.setModel({ value: e, property: props.element.optionProperty, context: props.fieldContext });
          },
          classNames: "tw-mb-4",
          clearable: props.element.clearable || false,
        },
        options: props.baseOptions,
      })
    );

    if (field.props.rules) {
      return () =>
        h(
          ValidationField,
          {
            props: unrefNested(field.props),
            options: unrefNested(field.options),
            index: props.elIndex,
            rows: props.rows,
            key: `${String(field.props.key)}_validation`,
          },
          () => h(field.component as any, unrefNested(field.props))
        );
    } else {
      return () => h(field.component as any, unrefNested(field.props));
    }
  },
};
