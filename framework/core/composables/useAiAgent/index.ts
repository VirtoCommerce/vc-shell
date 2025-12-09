import { inject, provide, computed } from "vue";
import { createAiAgentService, IAiAgentServiceInternal } from "../../services/ai-agent-service";
import { AiAgentServiceKey, LanguageServiceKey } from "../../../injection-keys";
import {
  IAiAgentService,
  IAiAgentConfig,
  IAiAgentMessage,
  IAiAgentBladeContext,
  IBladeSelectionService,
} from "../../types/ai-agent";
import { createLogger, InjectionError } from "../../utilities";
import { useUser } from "../useUser";
import { useBladeNavigation } from "../../../shared/components/blade-navigation/composables";

const logger = createLogger("use-ai-agent");

/**
 * Options for providing the AI agent service
 */
export interface ProvideAiAgentServiceOptions {
  /** Initial configuration for the AI agent */
  config?: Partial<IAiAgentConfig>;
  /** Custom function to get auth token (optional - defaults to empty string) */
  authTokenGetter?: () => string;
  /** Blade selection service instance (required) */
  selectionService: IBladeSelectionService;
}

/**
 * Provides the AI agent service at the current component level.
 * Should be called once at the app level (in VcApp).
 *
 * @param options - Configuration options including selectionService
 */
export function provideAiAgentService(options: ProvideAiAgentServiceOptions): IAiAgentServiceInternal {
  const { selectionService } = options;

  const languageService = inject(LanguageServiceKey);
  const { user } = useUser();
  const { blades, openBlade, resolveBladeByName } = useBladeNavigation();

  // Create the service
  const service = createAiAgentService({
    selectionService,
    userGetter: () => {
      if (!user.value) return undefined;
      return {
        id: user.value.id,
        userName: user.value.userName,
        isAdministrator: user.value.isAdministrator,
        permissions: user.value.permissions,
      };
    },
    bladeGetter: (): IAiAgentBladeContext | null => {
      // Get the last (most recent) blade
      const lastBlade = blades.value[blades.value.length - 1];
      if (!lastBlade) return null;

      return {
        id: lastBlade.type?.name?.toLowerCase() ?? "unknown",
        name: lastBlade.type?.name ?? "Unknown",
        title: lastBlade.props?.navigation?.instance?.title,
        param: lastBlade.props?.param,
        options: lastBlade.props?.options,
      };
    },
    authTokenGetter: options?.authTokenGetter ?? (() => ""),
    localeGetter: () => languageService?.currentLocale.value ?? "en",
    navigateToBlade: (bladeName: string, param?: string, bladeOptions?: Record<string, unknown>) => {
      const blade = resolveBladeByName(bladeName);
      if (blade) {
        openBlade({ blade, param, options: bladeOptions });
        logger.debug(`Navigated to blade: ${bladeName}`);
      } else {
        logger.warn(`Blade not found: ${bladeName}`);
      }
    },
    reloadBlade: () => {
      // Emit reload on current blade if available (last blade in the list)
      const lastBlade = blades.value[blades.value.length - 1];
      if (lastBlade?.props?.navigation?.instance?.reload) {
        lastBlade.props.navigation.instance.reload();
        logger.debug("Current blade reloaded");
      }
    },
    initialConfig: options?.config,
  });

  provide(AiAgentServiceKey, service);
  logger.debug("AiAgentService provided");

  return service;
}

/**
 * Return type for useAiAgent composable
 */
export interface UseAiAgentReturn {
  /** Current panel state ("closed" | "open" | "expanded") */
  panelState: IAiAgentService["panelState"];
  /** Panel configuration */
  config: IAiAgentService["config"];
  /** Current context (reactive) */
  context: IAiAgentService["context"];
  /** Whether panel is open (not closed) */
  isOpen: IAiAgentService["isOpen"];
  /** Whether panel is in expanded state */
  isExpanded: IAiAgentService["isExpanded"];
  /** Open the AI panel */
  openPanel: () => void;
  /** Close the AI panel */
  closePanel: () => void;
  /** Toggle panel open/close */
  togglePanel: () => void;
  /** Expand the panel to larger width */
  expandPanel: () => void;
  /** Collapse panel to normal width */
  collapsePanel: () => void;
  /** Update configuration */
  setConfig: (config: Partial<IAiAgentConfig>) => void;
  /** Send message to AI agent iframe */
  sendMessage: IAiAgentService["sendMessage"];
  /** Register message handler, returns unsubscribe function */
  onMessage: (handler: (event: IAiAgentMessage) => void) => () => void;
}

/**
 * Composable for interacting with the AI agent panel.
 *
 * @example
 * ```typescript
 * const { togglePanel, isOpen, onMessage } = useAiAgent();
 *
 * // Toggle AI panel
 * const handleAiClick = () => togglePanel();
 *
 * // Listen for messages from AI agent
 * onMessage((message) => {
 *   if (message.type === 'AI_AGENT_ACTION_REQUEST') {
 *     // Handle action request
 *   }
 * });
 * ```
 */
export function useAiAgent(): UseAiAgentReturn {
  const service = inject(AiAgentServiceKey);
  if (!service) {
    logger.error("AiAgentService not found. Did you forget to call provideAiAgentService()?");
    throw new InjectionError("AiAgentService");
  }

  return {
    // State
    panelState: service.panelState,
    config: service.config,
    context: service.context,
    isOpen: service.isOpen,
    isExpanded: service.isExpanded,

    // Panel control
    openPanel: service.openPanel,
    closePanel: service.closePanel,
    togglePanel: service.togglePanel,
    expandPanel: service.expandPanel,
    collapsePanel: service.collapsePanel,

    // Configuration
    setConfig: service.setConfig,

    // Communication
    sendMessage: service.sendMessage,
    onMessage: service.onMessage,
  };
}

/**
 * Creates a toolbar button configuration for opening the AI agent.
 * Can be used directly in blade toolbar definitions.
 *
 * @example
 * ```typescript
 * const bladeToolbar = [
 *   createAiAgentToolbarButton(),
 *   // ... other toolbar items
 * ];
 * ```
 */
export function createAiAgentToolbarButton(options?: { title?: string; icon?: string }) {
  return {
    id: "ai-agent-toggle",
    icon: options?.icon ?? "lucide-sparkles",
    title: options?.title ?? "AI Assistant",
    clickHandler: () => {
      try {
        const service = inject(AiAgentServiceKey);
        if (service) {
          service.togglePanel();
        } else {
          logger.warn("AiAgentService not available for toolbar button");
        }
      } catch (e) {
        logger.error("Failed to toggle AI panel:", e);
      }
    },
  };
}
