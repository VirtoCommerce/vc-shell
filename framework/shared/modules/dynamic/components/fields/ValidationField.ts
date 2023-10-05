import { VNodeProps, computed, h, mergeProps, unref, useSlots } from "vue";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";
import { Field } from "vee-validate";

export default {
  name: "ValidationField",
  props: {
    props: Object,
    options: Object,
    slots: Object,
    index: Number,
    rows: Number,
  },
  setup(props) {
    const slots = useSlots();
    const fieldKey = computed(() =>
      unref(props.props).multilanguage
        ? `${String(props.props.key)}_${props.props.currentLanguage}`
        : String(props.props.key)
    );

    return () =>
      h(
        Field as any,
        {
          rules: props.props.rules,
          modelValue: unref(props.props.modelValue),
          label: props.props.label,
          key: fieldKey.value,
          name: props.rows > 1 && props.index >= 0 ? props.props?.name + "_" + props.index : props.props?.name,
        },
        {
          default: ({ errorMessage, errors, handleChange }) => {
            return slots.default().map((slot) =>
              h(
                slot,
                {
                  ...mergeProps(unrefNested(props.props) as VNodeProps, {
                    "onUpdate:modelValue": (e) => {
                      handleChange(e);
                    },
                  }),
                  error: !!errors.length,
                  errorMessage,
                  class: props.classNames,
                  key: fieldKey.value + "_control",
                },
                props.slots
              )
            );
          },
        }
      );
  },
};
