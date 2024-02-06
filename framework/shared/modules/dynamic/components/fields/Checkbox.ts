import { ExtractPropTypes, h, Component, unref } from "vue";
import { Checkbox } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { CheckboxSchema } from "../../types";
import { unwrapInterpolation } from "../../helpers/unwrapInterpolation";
import { toValue } from "@vueuse/core";

export default {
  name: "Checkbox",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CheckboxSchema }) {
    return () => {
      const field = Checkbox({
        props: {
          ...props.baseProps,
          trueValue: props.element.trueValue,
          falseValue: props.element.falseValue,
        },
        slots: {
          default: () => unref(unwrapInterpolation(props.element.content, toValue(props.fieldContext!))),
        },
      });

      const render = h(field.component as Component, field.props, field.slots);

      if (field.props.rules) {
        return h(
          ValidationField,
          {
            props: field.props,
            slots: field.slots,
            index: props.elIndex,
            rows: props.rows,
          },
          () => render,
        );
      } else {
        return render;
      }
    };
  },
};
