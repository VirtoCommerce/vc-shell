import { h, ExtractPropTypes, Component, unref } from "vue";
import { EditorField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";

export default {
  name: "EditorField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps>) {
    return () => {
      const field = EditorField({
        props: {
          ...props.baseProps,
          currentLanguage: props.currentLocale,
          assetsFolder: unref(props.formData).id || unref(props.formData).categoryId,
        },
        options: props.baseOptions,
      });

      const render = h(field.component as Component, field.props);

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