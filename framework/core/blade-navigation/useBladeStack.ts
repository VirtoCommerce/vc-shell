import { ref, computed, inject } from "vue";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { BladeDescriptor, BladeOpenEvent, IBladeStack } from "@core/blade-navigation/types";
import { BladeStackKey } from "@core/blade-navigation/types";

let _idCounter = 0;

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
 * @param bladeRegistry - Registry for resolving blade names → components
 * @internal
 */
export function createBladeStack(
  bladeRegistry: IBladeRegistry,
  hasAccess?: (permissions: string | string[] | undefined) => boolean,
): IBladeStack {
  // ── Internal State ────────────────────────────────────────────────────────
  const _blades = ref<BladeDescriptor[]>([]);

  // Guards: bladeId → guard function (returns true to PREVENT close)
  const _beforeCloseGuards = new Map<string, () => Promise<boolean>>();

  // Lifecycle callbacks stored per blade
  const _onOpenCallbacks = new Map<string, () => void>();
  const _onCloseCallbacks = new Map<string, () => void>();

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
  }

  function _resolveUrl(name: string): string | undefined {
    const registration = bladeRegistry.getBlade(name);
    if (!registration) return undefined;
    // registration.route holds the URL segment (e.g. "/orders")
    return registration.route;
  }

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

  async function openWorkspace(event: BladeOpenEvent): Promise<void> {
    const currentWorkspace = workspace.value;

    // Same workspace — no-op
    if (currentWorkspace?.name === event.name) return;

    // Validate blade exists in registry
    const bladeData = bladeRegistry.getBlade(event.name);
    if (!bladeData) {
      throw new Error(`[BladeStack] Blade '${event.name}' not found in registry`);
    }

    // Permission check (workspace only)
    if (hasAccess && bladeData.permissions && !hasAccess(bladeData.permissions)) {
      console.warn(`[BladeStack] Access denied to workspace '${event.name}'`);
      return;
    }

    // Close all existing blades (no guards — workspace switch is unconditional)
    _closeBladesCleanup([..._blades.value]);

    // Create workspace descriptor
    const descriptor: BladeDescriptor = {
      id: generateBladeId(),
      name: event.name,
      url: _resolveUrl(event.name),
      // workspace blades don't have param when opened first
      query: event.query,
      options: event.options,
      visible: true,
    };

    _blades.value = [descriptor];

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
  }

  async function openBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
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
      if (prevented) return;
    }

    // Cleanup closing blades
    _closeBladesCleanup(bladesToClose);

    // Create new blade descriptor
    const descriptor: BladeDescriptor = {
      id: generateBladeId(),
      name: event.name,
      url: _resolveUrl(event.name),
      param: event.param,
      query: event.query,
      options: event.options,
      parentId,
      visible: true,
    };

    // Replace blades: keep up to parent (inclusive), append new
    _blades.value = [..._blades.value.slice(0, parentIndex + 1), descriptor];

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
  }

  async function closeBlade(bladeId: string): Promise<boolean> {
    const index = _blades.value.findIndex((b) => b.id === bladeId);
    if (index === -1) return false;

    // Cannot close the workspace blade
    if (index === 0) return false;

    // Everything from this blade onwards will be closed
    const bladesToClose = _blades.value.slice(index);

    // Check guards (deepest first)
    const prevented = await _checkGuards(bladesToClose);
    if (prevented) return true;

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

    return false;
  }

  async function replaceCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
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
      if (prevented) return;
      _closeBladesCleanup(bladesToClose);
    }

    // Create replacement descriptor — keeps the SAME parent as the replaced blade,
    // so the new blade occupies the exact same position in the hierarchy.
    const descriptor: BladeDescriptor = {
      id: generateBladeId(),
      name: event.name,
      url: _resolveUrl(event.name),
      param: event.param,
      query: event.query,
      options: event.options,
      parentId: current.parentId,
      visible: true,
    };

    // Destroy old blade and put new one at the same index
    _closeBladesCleanup([current]);
    const updated = [..._blades.value.slice(0, currentIndex), descriptor, ..._blades.value.slice(currentIndex + 1)];
    _blades.value = updated;

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
  }

  async function coverCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void> {
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
      if (prevented) return;
      _closeBladesCleanup(bladesToClose);
    }

    // Create covering descriptor — parent is the HIDDEN blade (not its parent),
    // so callParent from the covering blade reaches the hidden blade's methods.
    const descriptor: BladeDescriptor = {
      id: generateBladeId(),
      name: event.name,
      url: _resolveUrl(event.name),
      param: event.param,
      query: event.query,
      options: event.options,
      parentId: current.id,
      visible: true,
    };

    // Hide current blade (don't destroy it) and append new blade after it
    const updated = _blades.value.slice(0, currentIndex);
    updated.push({ ...current, visible: false });
    updated.push(descriptor);
    _blades.value = updated;

    if (event.onOpen) _onOpenCallbacks.set(descriptor.id, event.onOpen);
    if (event.onClose) _onCloseCallbacks.set(descriptor.id, event.onClose);

    event.onOpen?.();
  }

  // ── Close Children ──────────────────────────────────────────────────────

  async function closeChildren(parentId: string): Promise<void> {
    const parentIndex = _blades.value.findIndex((b) => b.id === parentId);
    if (parentIndex === -1) return;

    const children = _blades.value.slice(parentIndex + 1);
    if (children.length === 0) return;

    // Check guards (deepest first)
    const prevented = await _checkGuards(children);
    if (prevented) return;

    // Cleanup and remove
    _closeBladesCleanup(children);
    _blades.value = _blades.value.slice(0, parentIndex + 1);
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
