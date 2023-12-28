import { computed, h, unref, useSlots, defineComponent, ComputedRef } from "vue";
import { Field } from "vee-validate";
import { reactify } from "@vueuse/core";

const validationFieldProps = {
  props: Object,
  index: Number,
  rows: Number,
};

export default defineComponent({
  name: "ValidationField",
  props: validationFieldProps,
  setup(props) {
    const slots = useSlots();
    const fieldKey = computed(() =>
      unref(props.props)?.multilanguage
        ? `${String(props.props?.key)}_${unref(props.props?.currentLanguage)}`
        : String(props.props?.key),
    );

    const fieldNameLang = reactify((name: string) => {
      return props.props?.multilanguage ? name + "_" + props.props.currentLanguage : name;
    });

    return () =>
      h(
        Field,
        {
          rules: props.props?.rules,
          modelValue: props.props?.modelValue,
          label: props.props?.label,
          key: fieldKey.value,
          name: fieldNameLang(
            (props.rows ?? 1) > 1 && (props.index ?? 0) >= 0
              ? props.props?.name + "_" + props.index
              : props.props?.name,
          ).value,
        },
        {
          default: ({ errorMessage, errors }: { errorMessage: ComputedRef<string | undefined>; errors: string[] }) => {
            return slots.default?.().map((slot) =>
              h(slot, {
                ...props.props,
                error: !!errors.length,
                errorMessage,
                key: fieldKey.value + "_control",
              }),
            );
          },
        },
      );
  },
});
