import { defineComponent, type PropType, type VNode } from "vue";

/**
 * Stable wrapper for rendering slot functions without recreating the component tree.
 *
 * VcColumn slots are captured at setup as static function references. Passed directly as
 * children, Vue diffs them as new VNodes on every parent re-render and rebuilds the
 * subtree. Wrapping them in a stable component instance lets Vue reuse the DOM.
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
