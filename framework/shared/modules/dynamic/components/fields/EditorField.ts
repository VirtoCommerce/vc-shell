import { h, ExtractPropTypes, Component } from "vue";
import { EditorField } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import ValidationField from "@shared/modules/dynamic/components/fields/ValidationField";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";
import { EditorSchema } from "@shared/modules/dynamic";

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
