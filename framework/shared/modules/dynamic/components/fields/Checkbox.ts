import { reactiveComputed } from "@vueuse/core";
import { ExtractPropTypes, h } from "vue";
import { Checkbox } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import ValidationField from "./ValidationField";

export default {
  name: "Checkbox",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps>) {
    const field = reactiveComputed(() =>
      Checkbox({
        props: {
          ...props.baseProps,
          trueValue: props.element.trueValue,
          falseValue: props.element.falseValue,
          classNames: "tw-mb-4",
        },
        options: props.baseOptions,
        slots: {
          default: () => props.element.content,
        },
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
          () => h(field.component, field.props)
        );
    } else {
      return () => h(field.component, field.props, field.slots);
    }
  },
};
