import { ComponentSlots } from "../../../../utilities/vueUtils";
import { h, resolveComponent, ExtractPropTypes, Component, VNode } from "vue";
import { MultivalueField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { MultivalueSchema } from "../../types";
import { VcMultivalue } from "../../../../../ui/components";
import { unrefNested } from "../../helpers/unrefNested";

type TScope = Parameters<ComponentSlots<typeof VcMultivalue>["item"]>["0"];

export default {
  name: "MultivalueField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: MultivalueSchema }) {
    return () => {
      const field = MultivalueField({
        props: Object.assign(
          {},
          {
            multivalue: props.element.multivalue,
            type: props.element.variant,
            optionValue: props.element.optionValue,
            optionLabel: props.element.optionLabel,
            options: props.element.options ? props.bladeContext.scope?.[props.element.options] : undefined,
            currentLanguage: props.currentLocale,
          },
          unrefNested(props.baseProps),
        ),

        slots:
          props.element.customTemplate &&
          ["item"].reduce(
            (obj, slot) => {
              obj[slot] = (scope: TScope) =>
                h(resolveComponent(props.element.customTemplate?.component as string), {
                  context: scope,
                  slotName: slot,
                });
              return obj;
            },
            {} as Record<string, (scope: TScope) => VNode>,
          ),
      });

      const render = h(field.component as unknown as Component, field.props, field.slots);

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
