import {
  h,
  provide,
  ref,
  VNode,
  PropType,
  Component,
  reactive,
  computed,
  toRefs,
  Slot,
  defineComponent,
  SetupContext,
  onErrorCaptured,
} from "vue";
import { BladeInstance, navigationViewLocation, BLADE_BACK_BUTTON } from "./../../../../../injection-keys";
import { BladeVNode, CoreBladeExposed, IBladeInstance } from "../../types";
import { toRef, watchTriggerable } from "@vueuse/core";
import { Breadcrumbs, FALLBACK_BLADE_ID } from "../../../../..";
import { DisplayableError } from "../../../../../core/utilities/error";

/**
 * Normalizes slot content
 * @param slot The slot to normalize
 * @param data The data to pass to the slot
 * @returns Normalized slot content or null
 */
function normalizeSlot(slot: Slot | undefined, data: { Component: VNode }): VNode | VNode[] | null {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}

// Define the props type for type safety
interface BladeViewProps {
  blade?: BladeVNode;
  expandable?: boolean;
  error?: DisplayableError | Error | null | undefined;
  breadcrumbs?: Breadcrumbs[];
  backButton?: Component;
}

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
      type: Object as PropType<DisplayableError | Error | null | undefined>,
      default: null,
    },
    breadcrumbs: {
      type: Array as PropType<Breadcrumbs[]>,
    },
    backButton: {
      type: Object as PropType<Component>,
      default: undefined,
    },
  },
  setup(props: BladeViewProps, { attrs, slots }: SetupContext) {
    const maximized = ref<boolean>(false);
    const viewRef = ref<CoreBladeExposed | undefined>();

    const bl = toRef(props.blade);
    const { backButton } = toRefs(props);

    /**
     * Links the blade instance to its navigation object.
     *
     * This is a crucial part of the blade navigation system:
     * 1. When a blade is mounted, we need to associate its instance with the navigation props
     * 2. This creates a two-way reference where the blade knows about its navigation context
     * 3. The navigation instance property is implemented as a getter to ensure it always returns
     *    the current value of viewRef
     *
     * The flush:sync option ensures this happens immediately in the same tick to prevent
     * timing issues where the instance might not be available when needed.
     */
    const linkBladeInstanceToNavigation = (): void => {
      const instance = viewRef.value;
      const blade = bl.value;

      if (!instance || !blade || !blade.props?.navigation) {
        return;
      }

      // Create a reactive getter for the instance property
      // This ensures that navigation.instance always returns the current viewRef value
      Object.defineProperty(blade.props.navigation, "instance", {
        get: () => instance,
        configurable: true,
        enumerable: true,
      });
    };

    // Use watchTriggerable to manually invoke the linking process when needed
    const { trigger: syncNavigationWithInstance } = watchTriggerable(
      () => [viewRef.value, bl.value] as const,
      () => linkBladeInstanceToNavigation(),
      { flush: "sync" },
    );

    // Provide the navigation view location without using non-null assertion
    if (bl.value) {
      provide(navigationViewLocation, bl.value);
    }

    provide(BLADE_BACK_BUTTON, backButton);

    provide(
      BladeInstance,
      computed<IBladeInstance>(() => ({
        id: (bl.value?.type.name ?? FALLBACK_BLADE_ID).toLowerCase(),
        param: bl.value?.props?.param,
        options: bl.value?.props?.options,
        expandable: props.expandable ?? false,
        maximized: maximized.value,
        error: props.error ?? null,
        navigation: bl.value?.props?.navigation,
        breadcrumbs: props.breadcrumbs,
        title: bl.value?.props?.navigation?.instance?.title,
      })),
    );

    /**
     * Handler for expanding the blade
     */
    const onExpand = (): void => {
      maximized.value = true;
    };

    /**
     * Handler for collapsing the blade
     */
    const onCollapse = (): void => {
      maximized.value = false;
    };

    /**
     * Callback function onClose, which is passed while opening blade, called when a BladeVNode is unmounted.
     * @param vnode The unmounted VNode.
     */
    const onVnodeUnmounted: BladeVNode["props"]["onVnodeUnmounted"] = (vnode): void => {
      if (vnode.component?.isUnmounted && typeof vnode.props?.navigation?.onClose === "function") {
        vnode.props.navigation.onClose();
      }
    };

    /**
     * Callback function onOpen, which is passed while opening blade, called when a BladeVNode is mounted.
     * @param vnode The mounted VNode.
     */
    const onVnodeMounted: BladeVNode["props"]["onVnodeMounted"] = (vnode): void => {
      if (vnode.component?.isMounted) {
        // Synchronize the blade instance with navigation when the component is mounted
        syncNavigationWithInstance();

        if (typeof vnode.props?.navigation?.onOpen === "function") {
          vnode.props.navigation.onOpen();
        }
      }
    };

    return () => {
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
