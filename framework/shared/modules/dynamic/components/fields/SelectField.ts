import { h, resolveComponent, ExtractPropTypes, Component, VNode } from "vue";
import { SelectField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { SelectSchema } from "../../types";
import { VcSelect } from "../../../../../ui/components";
import type { ComponentSlots } from "vue-component-type-helpers";

type TScope =
  | Parameters<ComponentSlots<typeof VcSelect>["option"]>["0"]
  | Parameters<ComponentSlots<typeof VcSelect>["selected-item"]>["0"];

export default {
  name: "SelectField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: SelectSchema }) {
    return () => {
      const field = SelectField({
        props: {
          ...props.baseProps,
          optionValue: props.element.optionValue,
          optionLabel: props.element.optionLabel,
          emitValue: props.element.emitValue,
          options: props.bladeContext.scope[props.element.optionsMethod],
          currentLanguage: props.currentLocale,
          clearable: props.element.clearable || false,
          searchable: props.element.searchable || false,
        },
        options: props.baseOptions,

        slots:
          props.element.customTemplate &&
          ["selected-item", "option"].reduce((obj, slot) => {
            obj[slot] = (scope: TScope) =>
              h(resolveComponent(props.element.customTemplate.component), { context: scope, slotName: slot });
            return obj;
          }, {} as Record<string, (scope: TScope) => VNode>),
      });

      const render = h(field.component as unknown as Component, field.props, field.slots);

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
              () => render
            )
          : null;
      } else {
        return props.baseOptions.visibility ? render : null;
      }
    };
  },
};