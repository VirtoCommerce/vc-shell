import { Component, ExtractPropTypes, h } from "vue";
import { Switch } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import { SwitchSchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

export default {
  name: "SwitchEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: SwitchSchema }) {
    return () => {
      const field = Switch({
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
      });

      return h(field.component as Component, field.props);
    };
  },
};
