export const AI_AGENT_SYMBOLS = new Set([
  "aiAgentPlugin",
  "useAiAgent",
  "useAiAgentContext",
  "VcAiAgentPanel",
  "IAiAgentConfig",
  "AiAgentPluginOptions",
]);

export const EXTENSIONS_SYMBOLS = new Set([
  "defineExtensionPoint",
  "useExtensionPoint",
  "ExtensionPoint",
  "ExtensionPoints",
]);

export const SYMBOL_TO_ENTRY: Map<string, string> = new Map();

for (const sym of AI_AGENT_SYMBOLS) {
  SYMBOL_TO_ENTRY.set(sym, "@vc-shell/framework/ai-agent");
}
for (const sym of EXTENSIONS_SYMBOLS) {
  SYMBOL_TO_ENTRY.set(sym, "@vc-shell/framework/extensions");
}
