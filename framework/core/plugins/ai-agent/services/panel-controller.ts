import { ref, computed, type Ref, type ComputedRef } from "vue";
import { createLogger } from "@core/utilities";
import type { AiAgentPanelState } from "@core/plugins/ai-agent/types";

const logger = createLogger("ai-agent-panel");

export interface PanelController {
  panelState: Ref<AiAgentPanelState>;
  isOpen: ComputedRef<boolean>;
  isExpanded: ComputedRef<boolean>;
  isInitialized: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  resetInitialized: () => void;
}

export function createPanelController(): PanelController {
  const panelState = ref<AiAgentPanelState>("closed");
  const isInitialized = ref(false);

  const isOpen = computed(() => panelState.value !== "closed");
  const isExpanded = computed(() => panelState.value === "expanded");

  const open = () => {
    if (panelState.value === "closed") {
      panelState.value = "open";
      logger.debug("Panel opened");
    }
  };

  const close = () => {
    panelState.value = "closed";
    isInitialized.value = false;
    logger.debug("Panel closed, reset initialized state");
  };

  const toggle = () => {
    if (panelState.value === "closed") {
      open();
    } else {
      close();
    }
  };

  const expand = () => {
    if (panelState.value === "open") {
      panelState.value = "expanded";
      logger.debug("Panel expanded");
    }
  };

  const collapse = () => {
    if (panelState.value === "expanded") {
      panelState.value = "open";
      logger.debug("Panel collapsed");
    }
  };

  return {
    panelState,
    isOpen,
    isExpanded,
    isInitialized,
    open,
    close,
    toggle,
    expand,
    collapse,
    resetInitialized: () => {
      isInitialized.value = false;
    },
  };
}
