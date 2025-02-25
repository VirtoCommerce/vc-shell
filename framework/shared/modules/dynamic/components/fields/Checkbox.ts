import { ExtractPropTypes, h, Component, unref, computed } from "vue";
import { Checkbox } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { CheckboxSchema } from "../../types";
import { unwrapInterpolation } from "../../helpers/unwrapInterpolation";
import { toValue } from "@vueuse/core";
import { unrefNested } from "../../helpers/unrefNested";
import { useI18n } from "vue-i18n";

export default {
  name: "Checkbox",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CheckboxSchema }) {
    const { t } = useI18n({ useScope: "global" });
    return () => {
      const field = Checkbox({
        props: Object.assign(
          {},
          {
            trueValue: props.element.trueValue,
            falseValue: props.element.falseValue,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
        slots: {
          default: () =>
            unref(computed(() => t(unwrapInterpolation(props.element.content, toValue(props.fieldContext!))))),
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
