import { ComputedRef, ref, computed, Component, MaybeRef, Ref, toValue } from "vue";

export interface AppBarButtonContent {
  id: string;
  component?: Component;
  props?: Record<string, unknown>;
  icon?: Component | string;
  onClick?: () => void;
  order?: number;
  onClose?: () => void;
  isVisible?: MaybeRef<boolean> | ComputedRef<boolean>;
}

export interface IAppBarMobileButtonsService {
  registeredButtons: ComputedRef<AppBarButtonContent[]>;
  register: (button: AppBarButtonContent) => void;
  unregister: (buttonId: string) => void;
  getButton: (buttonId: string) => AppBarButtonContent | undefined;
  getButtons: ComputedRef<AppBarButtonContent[]>;
}

/**
 * Creates a service for managing mobile AppBar buttons
 * Handles button registration and retrieval for mobile app bar
 */
export function createAppBarMobileButtonsService(): IAppBarMobileButtonsService {
  const registeredButtonsState = ref<AppBarButtonContent[]>([]) as Ref<AppBarButtonContent[]>;
  const registeredButtons = computed(() => registeredButtonsState.value);

  const register = (button: AppBarButtonContent) => {
    const existingButtonIndex = registeredButtonsState.value.findIndex((b) => b.id === button.id);

    if (existingButtonIndex >= 0) {
      registeredButtonsState.value[existingButtonIndex] = button;
    } else {
      registeredButtonsState.value.push(button);
    }
  };

  const unregister = (buttonId: string) => {
    registeredButtonsState.value = registeredButtonsState.value.filter((button) => button.id !== buttonId);
  };

  const getButton = (buttonId: string) => {
    return registeredButtonsState.value.find((button) => button.id === buttonId);
  };

  const getButtons = computed(() =>
    [...registeredButtonsState.value]
      .filter((button) => toValue(button.isVisible) !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  );

  return {
    registeredButtons,
    register,
    unregister,
    getButton,
    getButtons,
  };
}
