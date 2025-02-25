import { ref, computed, ComputedRef } from "vue";
import type { Component } from "vue";

export interface AppBarButtonContent {
  id: string;
  content: Component | null;
  overlayed?: boolean;
  props?: Record<string, unknown>;
}

export interface AppBarOverlayState {
  isOverlayVisible: ComputedRef<boolean>;
  overlayContent: ComputedRef<Component | null>;
  overlayProps: ComputedRef<Record<string, unknown>>;
  activeButtonId: ComputedRef<string | null>;
  isOverlayed: ComputedRef<boolean>;
  showContent: (button: AppBarButtonContent | null) => void;
  hideContent: () => void;
}

type OverlayState = {
  isVisible: boolean;
  content: Component | null;
  props: Record<string, unknown>;
  buttonId: string | null;
  overlayed: boolean;
};

const overlayState = ref<OverlayState>({
  isVisible: false,
  content: null,
  props: {},
  buttonId: null,
  overlayed: false,
});

const isOverlayVisible = computed(() => overlayState.value.isVisible);
const overlayContent = computed(() => overlayState.value.content);
const overlayProps = computed(() => overlayState.value.props);
const activeButtonId = computed(() => overlayState.value.buttonId);
const isOverlayed = computed(() => overlayState.value.overlayed);

export const useAppBarOverlay = (): AppBarOverlayState => {
  const showContent = (button: AppBarButtonContent | null) => {
    if (!button) {
      hideContent();
      return;
    }

    overlayState.value = {
      isVisible: button.overlayed || false,
      content: button.content,
      props: button.props || {},
      buttonId: button.id,
      overlayed: button.overlayed || false,
    };
  };

  const hideContent = () => {
    overlayState.value = {
      isVisible: false,
      content: null,
      props: {},
      buttonId: null,
      overlayed: false,
    };
  };

  return {
    isOverlayVisible: computed(() => isOverlayVisible.value),
    overlayContent: computed(() => overlayContent.value),
    overlayProps: computed(() => overlayProps.value),
    activeButtonId: computed(() => activeButtonId.value),
    isOverlayed: computed(() => isOverlayed.value),
    showContent,
    hideContent,
  };
};
