// @vc-shell/framework/ai-agent — Public API for AI Agent integration
// Only symbols intended for external consumers are exported here.

// Plugin
export { aiAgentPlugin } from "@core/plugins/ai-agent/index";
export type { AiAgentPluginOptions } from "@core/plugins/ai-agent/index";

// Composables
export { useAiAgent, createAiAgentToolbarButton } from "@core/plugins/ai-agent/composables/useAiAgent";
export type { UseAiAgentReturn } from "@core/plugins/ai-agent/composables/useAiAgent";

export { useAiAgentContext } from "@core/plugins/ai-agent/composables/useAiAgentContext";
export type { UseAiAgentContextReturn, UseAiAgentContextOptions } from "@core/plugins/ai-agent/types";

// Component
export { VcAiAgentPanel } from "@core/plugins/ai-agent/components";

// Types
export type { IAiAgentConfig, IAiAgentService } from "@core/plugins/ai-agent/types";

// Constants
export { DEFAULT_AI_AGENT_CONFIG, AI_AGENT_URL_ENV_KEY } from "@core/plugins/ai-agent/constants";

// Message types for embedded app communication
export { EMBEDDED_TO_HOST_MESSAGE_TYPES, HOST_TO_EMBEDDED_MESSAGE_TYPES } from "@core/plugins/ai-agent/constants";

// Protocol types
export type { IAiContextUpdatePayload, IAiChatMessagePayload, IAiAgentMessage } from "@core/plugins/ai-agent/types";
