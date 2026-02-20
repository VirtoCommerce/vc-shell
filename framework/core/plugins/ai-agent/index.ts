import type { App } from "vue";
import type { IAiAgentConfig } from "@core/plugins/ai-agent/types";
import { DEFAULT_AI_AGENT_CONFIG, AI_AGENT_URL_ENV_KEY } from "@core/plugins/ai-agent/constants";
import { createLogger } from "@core/utilities";

const logger = createLogger("ai-agent-plugin");

/**
 * Options for the AI Agent Plugin
 */
export interface AiAgentPluginOptions {
  /**
   * AI Agent configuration.
   * URL can also be set via APP_AI_AGENT_URL environment variable.
   */
  config?: Partial<IAiAgentConfig>;

  /**
   * Whether to add the AI button to all blade toolbars automatically.
   * Default: true
   */
  addGlobalToolbarButton?: boolean;
}

/**
 * Vue plugin for AI Agent integration.
 *
 * @example
 * ```typescript
 * import { createApp } from "vue";
 * import { aiAgentPlugin } from "@vc-shell/framework";
 *
 * const app = createApp(App);
 *
 * // Install with options
 * app.use(aiAgentPlugin, {
 *   config: {
 *     title: "AI Assistant",
 *     width: 400,
 *   },
 *   addGlobalToolbarButton: true,
 * });
 * ```
 */
export const aiAgentPlugin = {
  install(app: App, options: AiAgentPluginOptions = {}) {
    const { config = {}, addGlobalToolbarButton = true } = options;

    // Get URL from environment variable if not provided
    let url = config.url || "";
    if (!url && typeof import.meta !== "undefined" && import.meta.env) {
      url = import.meta.env[AI_AGENT_URL_ENV_KEY] || "";
    }

    // Skip installation if no URL configured
    if (!url) {
      logger.info("AI Agent plugin skipped: no URL configured. Set APP_AI_AGENT_URL env variable or pass config.url option.");
      return;
    }

    // Merge config with defaults
    const finalConfig: IAiAgentConfig = {
      ...DEFAULT_AI_AGENT_CONFIG,
      ...config,
      url,
    };

    // Store config in app global properties for access during service creation
    app.config.globalProperties.$aiAgentConfig = finalConfig;
    app.provide("aiAgentConfig", finalConfig);
    app.provide("aiAgentAddGlobalToolbarButton", addGlobalToolbarButton);

    logger.info(`AI Agent plugin installed. URL: ${url}, addGlobalToolbarButton: ${addGlobalToolbarButton}`);
  },
};

// Re-export all types
export * from "@core/plugins/ai-agent/types";
export * from "@core/plugins/ai-agent/constants";

// Re-export composables
export { useAiAgent, provideAiAgentService, createAiAgentToolbarButton } from "@core/plugins/ai-agent/composables/useAiAgent";
export type { UseAiAgentReturn, ProvideAiAgentServiceOptions } from "@core/plugins/ai-agent/composables/useAiAgent";

export { useAiAgentContext, clearPreviewState } from "@core/plugins/ai-agent/composables/useAiAgentContext";

// Re-export components
export { VcAiAgentPanel } from "@core/plugins/ai-agent/components";

// Re-export service types
export type { IAiAgentServiceInternal, CreateAiAgentServiceOptions } from "@core/plugins/ai-agent/services/ai-agent-service";
