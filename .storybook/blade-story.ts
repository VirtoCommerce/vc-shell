import { computed, defineComponent, h, provide, ref, shallowRef, type Component, type PropType } from "vue";
import { ToolbarServiceKey, WidgetServiceKey } from "../framework/injection-keys";
import {
  BladeBannersKey,
  BladeDescriptorKey,
  BladeMessagingKey,
  BladeStackKey,
  type BladeDescriptor,
  type BladeOpenEvent,
  type IBladeBanner,
} from "../framework/core/blade-navigation/types";
import { createToolbarService } from "../framework/core/services/toolbar-service";
import { createWidgetService } from "../framework/core/services/widget-service";

/**
 * A blade outside the shell: what `useBlade()` needs, with room for one child blade (the details
 * blade the asset blades open). Opening replaces the child, closing unmounts it.
 */

export type ChildEvent = BladeOpenEvent & { parentId?: string };

export function createChildSlot(ids: { parent: string; child: string }) {
  const child = shallowRef<ChildEvent & { key: number }>();
  let opened = 0;

  function close(): boolean {
    const current = child.value;
    if (!current) return false;
    child.value = undefined;
    current.onClose?.();
    return true;
  }

  return {
    ids,
    child,
    open: async (event: ChildEvent) => {
      close();
      child.value = { ...event, key: ++opened };
    },
    close: async (id: string) => (id === ids.child ? close() : false),
    closeChildren: async (parentId: string) => {
      if (parentId === ids.parent) close();
    },
  };
}

export type ChildSlot = ReturnType<typeof createChildSlot>;

function provideBladeServices(descriptor: () => BladeDescriptor) {
  provide(ToolbarServiceKey, createToolbarService());
  provide(WidgetServiceKey, createWidgetService());
  provide(BladeBannersKey, ref<IBladeBanner[]>([]));
  provide(BladeDescriptorKey, computed(descriptor));
}

/** Provides the blade context for the story's own blade. */
export function provideStoryBlade(name: string, options: object, slot: ChildSlot) {
  provideBladeServices(() => ({
    id: slot.ids.parent,
    name,
    visible: true,
    parentId: "parent-blade",
    options: options as Record<string, unknown>,
  }));
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: computed(() => ({ id: slot.child.value ? slot.ids.child : slot.ids.parent })),
    openWorkspace: async () => {},
    openBlade: slot.open,
    closeBlade: slot.close,
    closeChildren: slot.closeChildren,
    replaceCurrentBlade: async () => {},
    coverCurrentBlade: async () => {},
    registerBeforeClose: () => {},
    unregisterBeforeClose: () => {},
    setBladeError: () => {},
    clearBladeError: () => {},
    setBladeTitle: () => {},
    _restoreStack: () => {},
  } as never);
  provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
}

/** The child blade, with its own descriptor, toolbar and widgets, as a blade in the real stack would have. */
export const ChildBlade = defineComponent({
  props: {
    event: { type: Object as PropType<ChildEvent>, required: true },
    component: { type: Object as PropType<Component>, required: true },
    id: { type: String, required: true },
  },
  setup(props) {
    provideBladeServices(() => ({
      id: props.id,
      name: props.event.name ?? "",
      visible: true,
      parentId: props.event.parentId,
      options: props.event.options as Record<string, unknown>,
    }));
    return () => h(props.component);
  },
});
