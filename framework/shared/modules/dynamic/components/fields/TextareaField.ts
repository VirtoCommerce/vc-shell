import { TextareaField } from "@shared/modules/dynamic/components/factories";
import { TextareaSchema } from "@shared/modules/dynamic/types";
import { ExtractPropTypes, h, Component } from "vue";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import ValidationField from "@shared/modules/dynamic/components/fields/ValidationField";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

export default {
  name: "TextareaField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: TextareaSchema }) {
    return () => {
      const field = TextareaField({
        props: Object.assign(
          {},
          {
            currentLanguage: props.currentLocale,
            clearable: props.element.clearable || false,
            maxlength: props.element.maxlength,
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
