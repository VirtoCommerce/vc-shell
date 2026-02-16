import { provideAiAgentService } from "../plugins/ai-agent";
import type { IAiAgentConfig } from "../plugins/ai-agent";
import type { ShellFeature } from "../types/shell-feature";

/**
 * Creates an AI agent shell feature from the provided config.
 * Not included in defaultFeatures — created conditionally when aiAgentConfig is injected.
 */
export function createAiAgentFeature(
  config: IAiAgentConfig,
  addGlobalToolbarButton = true,
): ShellFeature {
  return {
    id: "ai-agent",
    onSetup: () => {
      provideAiAgentService({
        config,
        addGlobalToolbarButton,
      });
    },
  };
}
