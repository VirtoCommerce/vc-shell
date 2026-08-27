import { ref, computed, inject, type Ref } from "vue";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { BladeDescriptor, BladeOpenEvent, IBladeStack, UrlSink } from "@core/blade-navigation/types";
import type { Breadcrumbs } from "@core/types/breadcrumbs";
import { BladeStackKey, NOOP_URL_SINK } from "@core/blade-navigation/types";
import {
  createWorkspaceDescriptor,
  createChildDescriptor,
  createReplacementDescriptor,
  createCoveringDescriptor,
  type DescriptorFactoryContext,
} from "@core/blade-navigation/descriptorFactory";

let _idCounter = 0;

/**
 * What a close attempt did. The public `closeBlade` collapses this back to the
 * legacy "prevented" boolean, but the URL sync needs to tell a real close from
 * a refusal (unknown id, or the workspace blade, which cannot be closed).
 */
type CloseOutcome = "closed" | "prevented" | "refused";

/** Generate a unique blade instance ID */
function generateBladeId(): string {
  return `blade_${++_idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates the BladeStack state machine.
 *
 * The stack manages an ordered list of BladeDescriptor objects (plain data).
 * All mutations go through explicit actions — no direct VNode manipulation.
 *
 * The stack also owns URL sync: every navigation action writes the URL through
 * `urlSink` with the verb it implies (push for opens, replace for closes), so a
 * caller cannot mutate the stack and forget the URL.
 *
 * @param bladeRegistry - Registry for resolving blade names → components
 * @param hasAccess - Permission check for workspace access
 * @param urlSink - Where the URL is written. Defaults to a no-op (no router).
 * @internal
 */
export function createBladeStack(
  bladeRegistry: IBladeRegistry,
  hasAccess?: (permissions: string | string[] | undefined) => boolean,
  urlSink: UrlSink = NOOP_URL_SINK,
): IBladeStack {
  // ── Internal State ────────────────────────────────────────────────────────
  const _blades = ref<BladeDescriptor[]>([]);

  // Guards: bladeId → guard function (returns true to PREVENT close)
  const _beforeCloseGuards = new Map<string, () => Promise<boolean>>();

  // Lifecycle callbacks stored per blade
  const _onOpenCallbacks = new Map<string, () => void>();
  const _onCloseCallbacks = new Map<string, () => void>();

  // Maximized state per blade
  const _maximized = new Map<string, Ref<boolean>>();

  // ── Computed (readonly) ───────────────────────────────────────────────────
  const workspace = computed(() => _blades.value[0]);

  const blades = computed<readonly BladeDescriptor[]>(() => _blades.value);

  const activeBlade = computed(() => {
    for (let i = _blades.value.length - 1; i >= 0; i--) {
      if (_blades.value[i].visible) return _blades.value[i];
    }
    return undefined;
  });

  // ── Internal Helpers ──────────────────────────────────────────────────────

  function _cleanupBlade(bladeId: string): void {
    _beforeCloseGuards.delete(bladeId);
    _onOpenCallbacks.delete(bladeId);
    _onCloseCallbacks.delete(bladeId);
    _maximized.delete(bladeId);
  }

  function _resolveUrl(name: string): string | undefined {
    const registration = bladeRegistry.getBlade(name);
    if (!registration) return undefined;
    // registration.route holds the URL segment (e.g. "/orders")
    return registration.route;
  }

  // Shared context for the descriptor factories — encodes ID generation and
  // URL resolution once so all four open paths produce descriptors identically.
  const _descriptorCtx: DescriptorFactoryContext = {
    generateId: generateBladeId,
    resolveUrl: _resolveUrl,
  };

  /**
   * Check guards for a list of blades (deepest first).
   * Returns true if any guard prevented the close.
   */
  async function _checkGuards(bladesToClose: BladeDescriptor[]): Promise<boolean> {
    // Reverse: check deepest blade first
    for (let i = bladesToClose.length - 1; i >= 0; i--) {
      const guard = _beforeCloseGuards.get(bladesToClose[i].id);
      if (guard) {
        const prevented = await guard();
        if (prevented) return true;
      }
    }
    return false;
  }

  /**
   * Fire onClose callbacks and cleanup for a list of blades.
   */
  function _closeBladesCleanup(bladesToClose: BladeDescriptor[]): void {
    for (const blade of bladesToClose) {
      _onCloseCallbacks.get(blade.id)?.();
      _cleanupBlade(blade.id);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** @returns true when the workspace was actually opened. */
  async function _openWorkspace(event: BladeOpenEvent): Promise<boolean> {
    const currentWorkspace = workspace.value;

    // Same workspace — no-op
    if (currentWorkspace?.name === event.name) return false;

    // Validate blade exists in registry
    const bladeData = bladeRegistry.getBlade(event.name);
    if (!bladeData) {
      throw new Error(`[BladeStack] Blade '${event.name}' not found in registry`);
    }

    // Permission check (workspace only)
    if (hasAccess && bladeData.permissions && !hasAccess(bladeData.permissions)) {
      console.warn(`[BladeStack] Access denied to workspace '${event.name}'`);
      return false;
    }

    // Close all existing blades (no guards — workspace switch is unconditional)
    _closeBladesCleanup([..._blades.value]);

    // Create workspace descriptor
    const descriptor = createWorkspaceDescriptor(event, _descriptorCtx);

    _blades.value = [descriptor];

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
    return true;
  }

  /** @returns true when the blade was actually opened. */
  async function _openBlade(event: BladeOpenEvent & { parentId?: string }): Promise<boolean> {
    // Validate blade exists in registry
    if (!bladeRegistry.getBlade(event.name)) {
      throw new Error(`[BladeStack] Blade '${event.name}' not found in registry`);
    }

    const parentId = event.parentId ?? activeBlade.value?.id ?? workspace.value?.id;
    if (!parentId) {
      throw new Error("[BladeStack] Cannot open blade: no parent blade found");
    }

    const parentIndex = _blades.value.findIndex((b) => b.id === parentId);
    if (parentIndex === -1) {
      throw new Error(`[BladeStack] Parent blade '${parentId}' not found in stack`);
    }

    // Blades after the parent will be closed
    const bladesToClose = _blades.value.slice(parentIndex + 1);

    // Check guards (deepest first)
    if (bladesToClose.length > 0) {
      const prevented = await _checkGuards(bladesToClose);
      if (prevented) return false;
    }

    // Cleanup closing blades
    _closeBladesCleanup(bladesToClose);

    // Create new blade descriptor
    const descriptor = createChildDescriptor(event, parentId, _descriptorCtx);

    // Replace blades: keep up to parent (inclusive), append new
    _blades.value = [..._blades.value.slice(0, parentIndex + 1), descriptor];

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
    return true;
  }

  async function _closeBlade(bladeId: string): Promise<CloseOutcome> {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return "refused";

    // Cannot close the workspace blade
    if (index === 0) return "refused";

    // Everything from this blade onwards will be closed
    const bladesToClose = _blades.value.slice(index);

    // Check guards (deepest first)
    const prevented = await _checkGuards(bladesToClose);
    if (prevented) return "prevented";

    // Cleanup and fire onClose callbacks
    _closeBladesCleanup(bladesToClose);

    // Remove from stack
    _blades.value = _blades.value.slice(0, index);

    // Restore visibility of blade hidden by replaceCurrentBlade
    const lastIndex = _blades.value.length - 1;
    if (lastIndex > 0 && !_blades.value[lastIndex].visible) {
      const updated = [..._blades.value];
      updated[lastIndex] = { ...updated[lastIndex], visible: true };
      _blades.value = updated;
    }

    return "closed";
  }

  /** @returns true when the blade was actually replaced. */
  async function _replaceCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<boolean> {
    const current = activeBlade.value;
    if (!current) {
      throw new Error("[BladeStack] No active blade to replace");
    }

    // Validate blade exists in registry
    if (!bladeRegistry.getBlade(event.name)) {
      throw new Error(`[BladeStack] Blade '${event.name}' not found in registry`);
    }

    const currentIndex = _blades.value.findIndex((b) => b.id === current.id);
    if (currentIndex === -1) {
      throw new Error(`[BladeStack] Active blade '${current.id}' not found in stack`);
    }

    // Close any blades after the current one first
    const bladesToClose = _blades.value.slice(currentIndex + 1);
    if (bladesToClose.length > 0) {
      const prevented = await _checkGuards(bladesToClose);
      if (prevented) return false;
      _closeBladesCleanup(bladesToClose);
    }

    // Create replacement descriptor — keeps the SAME parent as the replaced blade,
    // so the new blade occupies the exact same position in the hierarchy.
    const descriptor = createReplacementDescriptor(event, current.parentId, _descriptorCtx);

    // Destroy old blade and put new one at the same index
    _closeBladesCleanup([current]);
    const updated = [..._blades.value.slice(0, currentIndex), descriptor, ..._blades.value.slice(currentIndex + 1)];
    _blades.value = updated;

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
    return true;
  }

  /** @returns true when the covering blade was actually opened. */
  async function _coverCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<boolean> {
    const current = activeBlade.value;
    if (!current) {
      throw new Error("[BladeStack] No active blade to cover");
    }

    // Validate blade exists in registry
    if (!bladeRegistry.getBlade(event.name)) {
      throw new Error(`[BladeStack] Blade '${event.name}' not found in registry`);
    }

    const currentIndex = _blades.value.findIndex((b) => b.id === current.id);
    if (currentIndex === -1) {
      throw new Error(`[BladeStack] Active blade '${current.id}' not found in stack`);
    }

    // Close any blades after the current one first
    const bladesToClose = _blades.value.slice(currentIndex + 1);
    if (bladesToClose.length > 0) {
      const prevented = await _checkGuards(bladesToClose);
      if (prevented) return false;
      _closeBladesCleanup(bladesToClose);
    }

    // Create covering descriptor — parent is the HIDDEN blade (not its parent),
    // so callParent from the covering blade reaches the hidden blade's methods.
    const descriptor = createCoveringDescriptor(event, current.id, _descriptorCtx);

    // Hide current blade (don't destroy it) and append new blade after it
    const updated: BladeDescriptor[] = _blades.value.slice(0, currentIndex);
    updated.push({ ...current, visible: false });
    updated.push(descriptor);
    _blades.value = updated;

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
    return true;
  }

  // ── Close Children ──────────────────────────────────────────────────────

  /** @returns true when children were actually closed. */
  async function _closeChildren(parentId: string): Promise<boolean> {
    const parentIndex = _blades.value.findIndex((b) => b.id === parentId);
    if (parentIndex === -1) return false;

    const children = _blades.value.slice(parentIndex + 1);
    if (children.length === 0) return false;

    // Check guards (deepest first)
    const prevented = await _checkGuards(children);
    if (prevented) return false;

    // Cleanup and remove
    _closeBladesCleanup(children);
    _blades.value = _blades.value.slice(0, parentIndex + 1);
    return true;
  }

  // ── URL sync ──────────────────────────────────────────────────────────────
  // The sink resolves the location from this stack, so it must run after the
  // mutation. Opens sync only when the resulting blade has a URL segment: a
  // blade without one (e.g. a third-level detail panel) leaves the address bar
  // on the previous blade. An action that changed nothing never syncs — writing
  // the URL for a navigation that did not happen grows the history with
  // duplicate entries.

  function _syncOpened(verb: "push" | "replace"): void {
    if (activeBlade.value?.url) urlSink[verb]();
  }

  async function openWorkspace(event: BladeOpenEvent): Promise<void> {
    if (await _openWorkspace(event)) _syncOpened("push");
  }

  async function openBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
    if (await _openBlade(event)) _syncOpened("push");
  }

  async function replaceCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
    if (await _replaceCurrentBlade(event)) _syncOpened("replace");
  }

  async function coverCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
    if (await _coverCurrentBlade(event)) _syncOpened("push");
  }

  async function closeBlade(bladeId: string): Promise<boolean> {
    const outcome = await _closeBlade(bladeId);
    if (outcome === "closed") urlSink.replace();
    return outcome === "prevented";
  }

  async function closeChildren(parentId: string): Promise<void> {
    if (await _closeChildren(parentId)) urlSink.replace();
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  function registerBeforeClose(bladeId: string, guard: () => Promise<boolean>): void {
    _beforeCloseGuards.set(bladeId, guard);
  }

  function unregisterBeforeClose(bladeId: string): void {
    _beforeCloseGuards.delete(bladeId);
  }

  // ── Error Management ──────────────────────────────────────────────────────

  function setBladeError(bladeId: string, error: unknown): void {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return;

    // Immutable update: create new array with updated descriptor
    const updated = [..._blades.value];
    updated[index] = { ...updated[index], error };
    _blades.value = updated;
  }

  function clearBladeError(bladeId: string): void {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return;

    const updated = [..._blades.value];
    updated[index] = { ...updated[index], error: undefined };
    _blades.value = updated;
  }

  // ── Title Management ───────────────────────────────────────────────────────

  function setBladeTitle(bladeId: string, title: string | undefined): void {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return;
    if (_blades.value[index].title === title) return; // no-op if unchanged

    const updated = [..._blades.value];
    updated[index] = { ...updated[index], title };
    _blades.value = updated;
  }

  // ── Breadcrumb Trail ──────────────────────────────────────────────────────

  function trailFor(bladeId: string): Breadcrumbs[] {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return [];

    return _blades.value
      .slice(0, index)
      .filter((b) => b.visible)
      .map((b) => ({
        id: b.id,
        title: b.title ?? b.name,
        clickHandler: async (id: string) => {
          await closeChildren(id);
        },
      }));
  }

  // ── Query Management ──────────────────────────────────────────────────────

  function updateBladeQuery(bladeId: string, patch: Record<string, string>): void {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return;

    const current = _blades.value[index].query ?? {};
    const merged: Record<string, string> = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value == null) {
        delete merged[key];
      } else {
        merged[key] = value;
      }
    }

    // No-op if nothing actually changed (avoids redundant reactive updates).
    const currentKeys = Object.keys(current);
    const mergedKeys = Object.keys(merged);
    if (currentKeys.length === mergedKeys.length && mergedKeys.every((k) => current[k] === merged[k])) {
      return;
    }

    const updated = [..._blades.value];
    updated[index] = { ...updated[index], query: merged };
    _blades.value = updated;
  }

  // ── Maximized Management ───────────────────────────────────────────────────

  function getMaximizedRef(id: string): Ref<boolean> {
    let r = _maximized.get(id);
    if (!r) {
      r = ref(false);
      _maximized.set(id, r);
    }
    return r;
  }
  function isMaximized(id: string): boolean {
    return _maximized.get(id)?.value ?? false;
  }
  function setMaximized(id: string, value: boolean): void {
    getMaximizedRef(id).value = value;
  }
  function toggleMaximized(id: string): void {
    const r = getMaximizedRef(id);
    r.value = !r.value;
  }

  // ── Internal: Restore (used by HistoryManager) ────────────────────────────

  function _restoreStack(descriptors: BladeDescriptor[]): void {
    // Clear all existing callbacks/guards
    for (const blade of _blades.value) {
      _cleanupBlade(blade.id);
    }
    _blades.value = descriptors;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    workspace,
    blades,
    activeBlade,
    openWorkspace,
    openBlade,
    closeBlade,
    closeChildren,
    replaceCurrentBlade,
    coverCurrentBlade,
    registerBeforeClose,
    unregisterBeforeClose,
    setBladeError,
    clearBladeError,
    setBladeTitle,
    trailFor,
    updateBladeQuery,
    getMaximizedRef,
    isMaximized,
    setMaximized,
    toggleMaximized,
    _restoreStack,
  };
}

/**
 * Composable for accessing the BladeStack from within a component.
 * Must be used after BladeStack is provided via BladeStackKey.
 * @internal
 */
export function useBladeStack(): IBladeStack {
  const stack = inject(BladeStackKey);
  if (!stack) {
    throw new Error("[useBladeStack] BladeStack not found. Ensure BladeNavigationPlugin is installed.");
  }
  return stack;
}
