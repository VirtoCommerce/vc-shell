import { DefineComponent, PropType, UnwrapNestedRefs, defineComponent, h, reactive, ref, watchEffect } from "vue";
import SchemaRender from "../../../SchemaRender";
import { sourceHighlighter } from "../utils/sourceHighlighter";
import { ControlSchema, DetailsBladeContext } from "../../../..";
import { VcPopupContainer } from "../../../../../../components/popup-handler";
import { useForm } from "vee-validate";

export default defineComponent({
  title: "DynamicPage",
  props: {
    context: {
      type: Object as PropType<UnwrapNestedRefs<DetailsBladeContext>>,
      required: true,
      default: () => ({}) as DetailsBladeContext,
    },
    args: {
      type: Object as PropType<ControlSchema>,
      required: true,
      default: (): ControlSchema => ({}) as ControlSchema,
    },
    additionalSource: {
      type: Object as PropType<DefineComponent>,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    props = reactive(props);
    useForm({ validateOnMount: true });

    const highlightedCode = ref("");

    watchEffect(async () => {
      highlightedCode.value = await sourceHighlighter(props.args, props.context, props.additionalSource);
    });

    return () => [
      h(SchemaRender, {
        modelValue: props.context?.item,
        "onUpdate:modelValue": (value) => {
          ctx.emit("update:modelValue", value);
        },
        context: props.context,
        uiSchema: [props.args],
      }),

      h("pre", {
        ref: "pre",
        class: "tw-mt-4 tw-p-2 tw-bg-[#F7FAFC]",
        innerHTML: highlightedCode.value,
      }),
      h(VcPopupContainer),
    ];
  },
});
