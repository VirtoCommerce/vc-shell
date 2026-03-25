import { defineComponent, type PropType, type VNode } from "vue";

/**
 * Stable wrapper for rendering slot functions without recreating the component tree.
 *
 * When VcColumn slots are captured at setup time, they become static function references.
 * Passing them directly as children would cause Vue to diff them as new VNodes on every
 * parent re-render, destroying and recreating the subtree. SlotProxy wraps the function
 * in a stable component instance so Vue can reuse the existing DOM.
 */
export const SlotProxy = defineComponent({
  name: "SlotProxy",
  props: {
    slotFn: { type: Function as PropType<(scope: Record<string, unknown>) => VNode | VNode[]>, required: true },
    scope: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => props.slotFn(props.scope);
  },
});
