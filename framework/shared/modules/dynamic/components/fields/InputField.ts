import { reactiveComputed } from "@vueuse/core";
import { h } from "vue";
import { InputField } from "../factories";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import ValidationField from "./ValidationField";

export default {
  name: "InputField",
  props: componentProps,
  setup(props) {
    const field = reactiveComputed(() =>
      InputField({
        props: {
          ...props.baseProps,
          type: props.element.variant,
          currentLanguage: props.currentLocale,
          clearable: props.element.clearable || false,
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
          () => h(field.component, field.props)
        );
    } else {
      return () => h(field.component, field.props);
    }
  },
};
