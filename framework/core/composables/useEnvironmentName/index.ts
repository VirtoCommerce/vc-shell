import { createSharedComposable } from "@vueuse/core";

// Mirrors the platform environment banner (environment-banner.js): the current
// environment is derived client-side from the hostname, so it works before login
// and yields rich names (QA / UAT / Demo) without any API call.

const PRESET_TO_LABEL: Record<string, string> = {
  prod: "Production",
  dev: "Development",
  test: "QA",
  staging: "UAT",
  demo: "Demo",
};

// vc-shell theme tokens matching the platform vc-env-badge hues.
const PRESET_TO_COLOR: Record<string, string> = {
  prod: "danger",
  dev: "success",
  test: "warning",
  staging: "secondary",
  demo: "info",
};

const PRESETS_TO_IGNORE = ["prod"];
const FALLBACK_COLOR = "neutral";

export interface UseEnvironmentNameReturn {
  environmentName: string;
  isIgnored: boolean;
  color: string;
}

/**
 * Detect the environment preset from a hostname/env string, mirroring the
 * platform banner's detectThemePreset (environment-banner.js). Order matters:
 * prod is checked first so a "prod-qa" host resolves to prod.
 */
export function detectThemePreset(input: string): string {
  const s = (input || "").toLowerCase();
  if (s.includes("prod")) return "prod";
  if (s.includes("localhost") || /\b\d{1,3}(\.\d{1,3}){3}\b/.test(s) || s.includes("dev")) return "dev";
  if (s.includes("qa") || s.includes("test")) return "test";
  if (s.includes("stage") || s.includes("staging") || s.includes("uat")) return "staging";
  if (s.includes("demo")) return "demo";
  return "default";
}

/**
 * Resolve the banner state from a host string. Pure: no window/env access, so
 * it is unit-testable in isolation. `fallbackHost` is shown as the label when
 * the host carries no recognizable environment marker (preset "default").
 */
export function resolveEnvironment(hostString: string, fallbackHost = ""): UseEnvironmentNameReturn {
  const preset = detectThemePreset(hostString);
  const environmentName = PRESET_TO_LABEL[preset] ?? fallbackHost;
  const isIgnored = PRESETS_TO_IGNORE.includes(preset) || !environmentName;
  const color = PRESET_TO_COLOR[preset] ?? FALLBACK_COLOR;
  return { environmentName, isIgnored, color };
}

/**
 * Combine the browser hostname with the platform API hostname (APP_PLATFORM_URL).
 * Covers the case where the admin app is served from a neutral domain but the
 * backend it talks to carries the environment marker.
 */
function resolveHostString(): string {
  const locationHost = typeof window !== "undefined" ? window.location.hostname : "";
  let platformHost = "";
  try {
    const url = import.meta.env.APP_PLATFORM_URL;
    if (url) {
      platformHost = new URL(url).hostname;
    }
  } catch {
    // ignore a malformed APP_PLATFORM_URL
  }
  return `${locationHost} ${platformHost}`.trim();
}

/**
 * Internal factory. Exported for unit tests so they bypass the shared
 * composable cache (mirrors `_createInternalUserLogic` in useUser).
 */
export function _createEnvironmentNameLogic(): UseEnvironmentNameReturn {
  const fallbackHost = typeof window !== "undefined" ? window.location.hostname : "";
  return resolveEnvironment(resolveHostString(), fallbackHost);
}

export const useEnvironmentName = createSharedComposable(_createEnvironmentNameLogic);
