import { reactiveComputed } from "@vueuse/core";
import { h, resolveComponent, mergeProps } from "vue";
import { SelectField } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import ValidationField from "./ValidationField";

export default {
  name: "SelectField",
  props: componentProps,
  setup(props) {
    const field = reactiveComputed(() =>
      SelectField({
        props: {
          ...props.baseProps,
          optionValue: props.element.optionValue,
          optionLabel: props.element.optionLabel,
          emitValue: props.element.emitValue,
          options: props.scope[props.element.optionsMethod],
          currentLanguage: props.currentLocale,
          classNames: "tw-mb-4",
          clearable: props.element.clearable || false,
        },
        options: props.baseOptions,

        slots:
          props.element.customTemplate &&
          ["selected-item", "option"].reduce((obj, slot) => {
            obj[slot] = (scope) =>
              h(resolveComponent(props.element.customTemplate.component), { context: scope, slotName: slot });
            return obj;
          }, {}),
      })
    );

    if (field.props.rules) {
      return () =>
        h(
          ValidationField,
          {
            props: unrefNested(field.props),
            options: unrefNested(field.options),
            slots: unrefNested(field.slots),
            index: props.elIndex,
            rows: props.rows,
          },
          () =>
            h(
              field.component as any,
              mergeProps(unrefNested(field.props), {
                "onUpdate:modelValue": (e) =>
                  props.element.updateMethod &&
                  props.element.updateMethod in props.scope &&
                  typeof props.scope[props.element.updateMethod] === "function"
                    ? props.scope[props.element.updateMethod](e)
                    : undefined,
              })
            )
        );
    } else {
      return () =>
        h(
          field.component as any,
          mergeProps(unrefNested(field.props), {
            "onUpdate:modelValue": (e) =>
              props.element.updateMethod &&
              props.element.updateMethod in props.scope &&
              typeof props.scope[props.element.updateMethod] === "function"
                ? props.scope[props.element.updateMethod](e)
                : undefined,
          }),
          field.slots
        );
    }
  },
};
