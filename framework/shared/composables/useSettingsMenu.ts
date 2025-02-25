import { ref, computed, Component } from "vue";
import type { InjectionKey } from "vue";

export interface SettingsMenuItem {
  id: string;
  order?: number;
  component: Component;
  props?: Record<string, unknown>;
}

export interface RegisterSettingsMenuItemOptions extends Omit<SettingsMenuItem, "id"> {
  id?: string;
}

const settingsMenuItems = ref<Map<string, SettingsMenuItem>>(new Map());

export const useSettingsMenu = () => {
  const registerMenuItem = (options: RegisterSettingsMenuItemOptions): string => {
    const id = options.id || crypto.randomUUID();
    settingsMenuItems.value.set(id, {
      id,
      order: options.order ?? settingsMenuItems.value.size,
      component: options.component,
      props: options.props,
    });
    return id;
  };

  const unregisterMenuItem = (id: string): void => {
    settingsMenuItems.value.delete(id);
  };

  const items = computed(() => {
    return Array.from(settingsMenuItems.value.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  return {
    registerMenuItem,
    unregisterMenuItem,
    items,
  };
};

export const SettingsMenuKey: InjectionKey<ReturnType<typeof useSettingsMenu>> = Symbol("SettingsMenu");
