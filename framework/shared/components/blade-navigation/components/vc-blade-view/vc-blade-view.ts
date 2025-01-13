import { Slot, defineComponent, h, provide, ref, VNode, PropType, Component, reactive, computed } from "vue";
import { BladeInstance, navigationViewLocation } from "./../../../../../injection-keys";
import { BladeVNode, CoreBladeExposed } from "../../types";
import { toRef, watchTriggerable } from "@vueuse/core";
import { Breadcrumbs } from "../../../../..";

export const VcBladeView = defineComponent({
  name: "BladeView",
  inheritAttrs: false,
  props: {
    blade: {
      type: Object as PropType<BladeVNode>,
    },
    expandable: {
      type: Boolean,
    },
    error: {
      type: String,
    },
    breadcrumbs: {
      type: Array as PropType<Breadcrumbs[]>,
    },
  },
  setup(props, { attrs, slots }) {
    const maximized = ref(false);
    const viewRef = ref<CoreBladeExposed>();

    const bl = toRef(props.blade);

    const { trigger } = watchTriggerable(
      () => [viewRef.value, bl.value] as const,
      ([instance, blade]) => {
        if (instance && blade && blade.props?.navigation) {
          Object.assign(
            blade.props.navigation,
            reactive({
              get instance() {
                return instance;
              },
            }),
          );
        }
      },
      { flush: "sync" },
    );

    provide(navigationViewLocation, bl.value!);
    provide(
      BladeInstance,
      computed(() => ({
        id: bl.value?.type.name ?? "fallback-blade-id",
        expandable: props.expandable,
        maximized: maximized.value,
        error: props.error,
        navigation: bl.value?.props?.navigation,
        breadcrumbs: props.breadcrumbs,
      })),
    );
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
          trigger();
          if (typeof vnode.props?.navigation?.onOpen === "function") {
            vnode.props?.navigation.onOpen();
          }
        }
      };

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
            ref: viewRef,
            onVnodeUnmounted,
            onVnodeMounted,
            "onExpand:blade": onExpand,
            "onCollapse:blade": onCollapse,
          }),
        );

        return normalizeSlot(slots.default, { Component: component });
      }
      return null;
    };
  },
});

function normalizeSlot(slot: Slot | undefined, data: { Component: VNode }) {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
