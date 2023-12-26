import { Slot, defineComponent, h, provide, ref, watch, computed, VNode, VNodeProps, PropType, Component } from "vue";
import { navigationViewLocation } from "./../../injectionKeys";
import { BladeVNode } from "../../types";

export const VcBladeView = defineComponent({
  name: "BladeView",
  inheritAttrs: false,
  props: {
    blade: {
      type: Object as PropType<BladeVNode | VNode>,
    },
    name: {
      type: String,
    },

    idx: {
      type: Number,
    },
  },
  setup(props, { attrs, slots }) {
    provide(navigationViewLocation, props.blade);

    return () => {
      /**
       * Callback function onClose, which is passed while opening blade, called when a BladeVNode is unmounted.
       * @param vnode The unmounted VNode.
       */
      const onVnodeUnmounted: BladeVNode["props"]["onVnodeUnmounted"] = (vnode) => {
        if (vnode.component?.isUnmounted) {
          if (typeof vnode.props?.navigation?.onClose === "function") {
            vnode.props?.navigation.onClose();
          }
        }
      };

      /**
       * Callback function onOpen, which is passed while opening blade, called when a BladeVNode is mounted.
       * @param vnode The mounted VNode.
       */
      const onVnodeMounted: BladeVNode["props"]["onVnodeMounted"] = (vnode) => {
        if (vnode.component?.isMounted) {
          if (typeof vnode.props?.navigation?.onOpen === "function") {
            vnode.props?.navigation.onOpen();
          }
        }
      };

      const maximized = ref(false);

      function onExpand() {
        maximized.value = true;
      }

      function onCollapse() {
        maximized.value = false;
      }

      if (props.blade) {
        const component = h(
          props.blade as Component,
          Object.assign({}, attrs, {
            onVnodeUnmounted,
            onVnodeMounted,
            "onExpand:blade": onExpand,
            "onCollapse:blade": onCollapse,
            maximized,
          }),
        );

        return normalizeSlot(slots.default, { blade: component });
      }
      return null;
    };
  },
});

function normalizeSlot(slot: Slot | undefined, data: { blade: VNode }) {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
