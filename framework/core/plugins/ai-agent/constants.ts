import type { IAiAgentConfig, ISuggestion } from "@core/plugins/ai-agent/types";

/**
 * Default configuration for AI agent panel
 */
export const DEFAULT_AI_AGENT_CONFIG: IAiAgentConfig = {
  url: "",
  title: "Virto OZ",
  width: 362,
  expandedWidth: 500,
  allowedOrigins: ["*"],
};

/**
 * Environment variable name for AI agent URL
 */
export const AI_AGENT_URL_ENV_KEY = "APP_AI_AGENT_URL";

/**
 * Message types for Shell -> Chat communication
 */
export const SHELL_TO_CHAT_MESSAGE_TYPES = {
  INIT_CONTEXT: "INIT_CONTEXT",
  UPDATE_CONTEXT: "UPDATE_CONTEXT",
} as const;

/**
 * Message types for Chat -> Shell communication
 */
export const CHAT_TO_SHELL_MESSAGE_TYPES = {
  CHAT_READY: "CHAT_READY",
  NAVIGATE_TO_APP: "NAVIGATE_TO_APP",
  EXPAND_IN_CHAT: "EXPAND_IN_CHAT",
  RELOAD_BLADE: "RELOAD_BLADE",
  PREVIEW_CHANGES: "PREVIEW_CHANGES",
  APPLY_CHANGES: "APPLY_CHANGES",
  DOWNLOAD_FILE: "DOWNLOAD_FILE",
  SHOW_MORE: "SHOW_MORE",
  CHAT_ERROR: "CHAT_ERROR",
} as const;

/**
 * Default suggestions when no custom suggestions provided
 */
export const DEFAULT_SUGGESTIONS: ISuggestion[] = [
  {
    id: "generate-report",
    title: "Generate a report",
    icon: "analytics-01",
    iconColor: "#57AB79",
    prompt: "Generate a report",
  },
  {
    id: "find-sales",
    title: "Find sales statistics",
    icon: "progress-02",
    iconColor: "#FFBA35",
    prompt: "Find sales statistics",
  },
  {
    id: "translate",
    title: "Translate description",
    icon: "translation",
    iconColor: "#FF4A4A",
    prompt: "Translate description",
  },
  {
    id: "top-sales",
    title: "Find top sales report",
    icon: "analytics-up",
    iconColor: "#319ED4",
    prompt: "Find top sales report",
  },
];

/**
 * Default toolbar button ID for AI agent
 */
export const AI_AGENT_TOOLBAR_BUTTON_ID = "ai-agent-toggle";

/**
 * Default toolbar button icon
 */
export const AI_AGENT_TOOLBAR_BUTTON_ICON = "lucide-sparkles";

/**
 * Default toolbar button title
 */
export const AI_AGENT_TOOLBAR_BUTTON_TITLE = "AI Assistant";
