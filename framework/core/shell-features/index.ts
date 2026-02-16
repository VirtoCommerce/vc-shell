import type { InjectionKey } from "vue";
import { notificationsFeature } from "./notifications";
import { settingsFeature } from "./settings";
import type { ShellFeature } from "../types/shell-feature";

export const SHELL_FEATURES_KEY: InjectionKey<ShellFeature[]> = Symbol("ShellFeatures");

/**
 * Default shell features included when no custom features are provided.
 * AI agent is NOT included — it requires runtime config and is added conditionally.
 */
export const defaultFeatures: ShellFeature[] = [notificationsFeature, settingsFeature];

export { notificationsFeature, settingsFeature };
export { createAiAgentFeature } from "./ai-agent";
export type { ShellFeature, ShellContext } from "../types/shell-feature";
