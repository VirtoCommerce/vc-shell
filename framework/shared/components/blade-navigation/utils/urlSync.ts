import type { Router } from "vue-router";
import type { BladeDescriptor, IBladeStack, ParsedBladeUrl } from "../types";

/**
 * Build a URL path from the current blade stack.
 *
 * URL format: /<tenantPrefix>/<workspaceUrl>/<bladeUrl>/<param>
 * - tenantPrefix: optional seller/tenant ID
 * - workspaceUrl: from workspace blade's `url` (e.g. "/orders" → "orders")
 * - bladeUrl: from active child blade's `url` (e.g. "/order" → "order")
 * - param: entity ID
 *
 * @param tenantPrefix - Tenant/seller ID segment (empty string if none)
 * @param stack - Current blade stack
 * @returns path string and merged query params
 */
export function buildUrlFromStack(
  tenantPrefix: string,
  stack: readonly BladeDescriptor[],
): { path: string; query: Record<string, string> } {
  if (stack.length === 0) {
    return { path: tenantPrefix ? `/${tenantPrefix}` : "/", query: {} };
  }

  const workspace = stack[0];
  const wsUrl = normalizeSegment(workspace.url);

  // Find the last visible child blade (not the workspace)
  let activeBlade: BladeDescriptor | undefined;
  for (let i = stack.length - 1; i >= 1; i--) {
    if (stack[i].visible) {
      activeBlade = stack[i];
      break;
    }
  }

  // Build path: /tenant/workspace or /tenant/workspace/blade/param
  let path = tenantPrefix ? `/${tenantPrefix}` : "";

  if (wsUrl) {
    path += `/${wsUrl}`;
  }

  if (activeBlade) {
    const bladeUrl = normalizeSegment(activeBlade.url);
    if (bladeUrl) {
      path += `/${bladeUrl}`;
    }
    if (activeBlade.param) {
      path += `/${activeBlade.param}`;
    }
  }

  // Merge query params from all visible blades
  const query: Record<string, string> = {};
  for (const blade of stack) {
    if (blade.visible && blade.query) {
      Object.assign(query, blade.query);
    }
  }

  return { path: path || "/", query };
}

/**
 * Parse a URL path into workspace, blade, and param segments.
 *
 * Handles both with and without tenant prefix:
 *   /orders                    → { workspaceUrl: "orders" }
 *   /orders/order/uuid         → { workspaceUrl: "orders", bladeUrl: "order", param: "uuid" }
 *   /tenant-id/orders          → { workspaceUrl: "orders" } (after stripping tenant)
 *   /tenant-id/orders/order/id → { workspaceUrl: "orders", bladeUrl: "order", param: "id" }
 *
 * @param hashPath - The path portion after the hash (e.g. "/orders/order/uuid")
 * @param tenantPrefix - Optional tenant/seller ID to strip from the beginning
 */
export function parseBladeUrl(hashPath: string, tenantPrefix?: string): ParsedBladeUrl {
  let segments = hashPath.split("/").filter(Boolean);

  // Strip tenant prefix if present
  if (tenantPrefix && segments.length > 0 && segments[0] === tenantPrefix) {
    segments = segments.slice(1);
  }

  if (segments.length === 0) {
    return {};
  }

  return {
    workspaceUrl: segments[0],
    bladeUrl: segments[1],
    param: segments[2],
  };
}

/**
 * Build query string from a record of key-value pairs.
 * Returns empty string if no params.
 */
export function buildQueryString(query: Record<string, string>): string {
  const entries = Object.entries(query).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

/**
 * Normalize a URL segment by removing leading/trailing slashes.
 * "/orders/" → "orders", "orders" → "orders", undefined → undefined
 */
function normalizeSegment(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/^\/+|\/+$/g, "") || undefined;
}

// ── Centralized URL sync helpers ──────────────────────────────────────────────

/**
 * Extract the tenant prefix from the current route params.
 * Convention: first string param value (e.g. sellerId segment).
 */
export function getTenantPrefix(router: Router): string {
  const params = router.currentRoute.value.params;
  return (Object.values(params).find((v) => typeof v === "string" && v) as string) || "";
}

/**
 * Creates URL sync helpers bound to a specific router and blade stack.
 * Eliminates duplication between VcBladeNavigation and useBladeNavigationAdapter.
 *
 * @param router - Vue Router instance
 * @param bladeStack - BladeStack state machine
 */
export function createUrlSync(router: Router, bladeStack: IBladeStack) {
  /**
   * Push URL to create a browser history entry (for blade open).
   */
  function syncUrlPush(): void {
    const { path, query } = buildUrlFromStack(getTenantPrefix(router), bladeStack.blades.value);
    router.push({ path, query });
  }

  /**
   * Replace URL without creating a history entry (for blade close, cleanup).
   */
  function syncUrlReplace(): void {
    const { path, query } = buildUrlFromStack(getTenantPrefix(router), bladeStack.blades.value);
    router.replace({ path, query });
  }

  return { syncUrlPush, syncUrlReplace };
}
