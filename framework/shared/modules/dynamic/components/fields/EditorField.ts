/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactiveComputed } from "@vueuse/core";
import { h, ExtractPropTypes } from "vue";
import { EditorField } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import ValidationField from "./ValidationField";

export default {
  name: "EditorField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps>) {
    const field = reactiveComputed(() =>
      EditorField({
        props: {
          ...props.baseProps,
          currentLanguage: props.currentLocale,
          assetsFolder: props.formData.id || props.formData.categoryId,
          classNames: "tw-mb-4",
        },
        options: props.baseOptions,
      })
    );

    if (field.props.rules) {
      return () =>
        h(
          ValidationField,
          {
            props: unrefNested(field.props),
            options: unrefNested(field.options),
            index: props.elIndex,
            rows: props.rows,
            key: `${String(field.props.key)}_validation`,
          },
          () => h(field.component as any, field.props)
        );
    } else {
      return () => h(field.component as any, field.props);
    }
  },
};
