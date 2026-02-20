import { inject, provide } from "vue";
import { createAiAgentService, type IAiAgentServiceInternal } from "@core/plugins/ai-agent/services/ai-agent-service";
import { AiAgentServiceKey, LanguageServiceKey, ToolbarServiceKey } from "@framework/injection-keys";
import type {
  IAiAgentService,
  IAiAgentConfig,
  IAiAgentMessage,
  IAiAgentBladeContext,
} from "@core/plugins/ai-agent/types";
import { createLogger, InjectionError } from "@core/utilities";
import { useUser } from "@core/composables/useUser";
import { useBladeNavigation } from "@shared/components/blade-navigation/composables";
import { AI_AGENT_TOOLBAR_BUTTON_ID, AI_AGENT_TOOLBAR_BUTTON_ICON, AI_AGENT_TOOLBAR_BUTTON_TITLE } from "@core/plugins/ai-agent/constants";
import type { IToolbarService } from "@core/services/toolbar-service";

const logger = createLogger("use-ai-agent");

/**
 * Options for providing the AI agent service
 */
export interface ProvideAiAgentServiceOptions {
  /** Initial configuration for the AI agent */
  config?: Partial<IAiAgentConfig>;
  /**
   * Whether to add the AI button to all blade toolbars automatically.
   * Default: true
   */
  addGlobalToolbarButton?: boolean;
}

/**
 * Provides the AI agent service at the current component level.
 * Should be called once at the app level (in VcApp or plugin install).
 *
 * @param options - Configuration options
 */
export function provideAiAgentService(options?: ProvideAiAgentServiceOptions): IAiAgentServiceInternal {
  const languageService = inject(LanguageServiceKey);
  const { user, getAccessToken } = useUser();
  const { blades, openBlade, resolveBladeByName } = useBladeNavigation();

  // Create the service
  const service = createAiAgentService({
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
    localeGetter: () => languageService?.currentLocale.value ?? "en",
    tokenGetter: getAccessToken,
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

  // Register global toolbar button with wildcard "*" if enabled
  const addGlobalToolbarButton = options?.addGlobalToolbarButton ?? true;
  if (addGlobalToolbarButton) {
    // Get toolbar service from injection (already created by VcShell plugin)
    const toolbarService = inject<IToolbarService | null>(ToolbarServiceKey, null);
    if (toolbarService) {
      toolbarService.registerToolbarItem(
        {
          id: AI_AGENT_TOOLBAR_BUTTON_ID,
          icon: AI_AGENT_TOOLBAR_BUTTON_ICON,
          title: AI_AGENT_TOOLBAR_BUTTON_TITLE,
          clickHandler: () => {
            service.togglePanel();
          },
        },
        "*", // Wildcard for all blades
      );
      logger.debug("Global AI toolbar button registered with wildcard '*'");
    } else {
      logger.warn("Toolbar service not available, AI button not registered");
    }
  }

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
  /** Total count of items in current context */
  totalItemsCount: IAiAgentService["totalItemsCount"];
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
 *   if (message.type === 'PREVIEW_CHANGES') {
 *     // Handle preview changes
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
    totalItemsCount: service.totalItemsCount,

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
