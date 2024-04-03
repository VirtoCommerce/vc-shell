import { h, ExtractPropTypes, Component } from "vue";
import { EditorField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { unrefNested } from "../../helpers/unrefNested";
import { EditorSchema } from "../..";

export default {
  name: "EditorField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: EditorSchema }) {
    return () => {
      const field = EditorField({
        props: Object.assign(
          {},
          {
            currentLanguage: props.currentLocale,
            assetsFolder: props.element.assetsFolder,
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
