import { inject, computed, getCurrentInstance, provide, ref, isRef, watch, type ComputedRef, type MaybeRef } from "vue";
import {
    BladeDescriptorKey,
    BladeStackKey,
    BladeMessagingKey,
    BladeDataKey,
} from "@core/blade-navigation/types";
import type {
    BladeOpenEvent,
    IBladeStack,
} from "@core/blade-navigation/types";
import {
    bladeStackInstance,
    bladeMessagingInstance,
    bladeNavigationInstance,
} from "@shell/_internal/blade-navigation/plugin-v2";
import { createUrlSync } from "@core/blade-navigation/utils/urlSync";

export interface UseBladeReturn<TOptions = Record<string, unknown>> {
  // Identity (read-only) — runtime error outside blade context
  readonly id: ComputedRef<string>;
  readonly param: ComputedRef<string | undefined>;
  readonly options: ComputedRef<TOptions | undefined>;
  readonly query: ComputedRef<Record<string, string> | undefined>;
  readonly closable: ComputedRef<boolean>;
  readonly expanded: ComputedRef<boolean>;
  readonly name: ComputedRef<string>;
  /** @deprecated Use `defineBladeContext()` instead */
  provideBladeData(data: MaybeRef<Record<string, unknown>>): void;
  // Navigation — works everywhere
  openBlade(event: BladeOpenEvent & { isWorkspace?: boolean }): Promise<void>;
  // Actions — runtime error outside blade context
  closeSelf(): Promise<boolean>;
  closeChildren(): Promise<void>;
  replaceWith(event: BladeOpenEvent): Promise<void>;
  coverWith(event: BladeOpenEvent): Promise<void>;
  // Communication — runtime error outside blade context
  callParent<T = unknown>(method: string, args?: unknown): Promise<T>;
  exposeToChildren(methods: Record<string, (...args: unknown[]) => unknown>): void;
  // Guards — runtime error outside blade context
  onBeforeClose(guard: () => Promise<boolean>): void;
  // Lifecycle — runtime error outside blade context
  onActivated(callback: () => void): void;
  onDeactivated(callback: () => void): void;
  // Error management — runtime error outside blade context
  setError(error: unknown): void;
  clearError(): void;
}

const CONTEXT_ERROR_SUFFIX =
    "useBlade() was called outside a blade. Navigation methods (openBlade) work everywhere, " +
    "but blade-specific methods require the component to be rendered inside VcBladeSlot.";

function requireContext(method: string): never {
    throw new Error(
        `[vc-shell] ${method} requires blade context.\n${CONTEXT_ERROR_SUFFIX}`,
    );
}

/**
 * Unified blade composable — works **everywhere**.
 *
 * Inside a blade (rendered by VcBladeSlot): full API — identity, navigation,
 * communication, guards, error management.
 *
 * Outside a blade (dashboard cards, notification templates, composables):
 * navigation methods (openBlade) work via singletons; blade-specific methods
 * throw a descriptive runtime error on invocation.
 *
 * @example Inside blade
 * ```ts
 * const { id, param, openBlade, closeSelf, callParent } = useBlade();
 * openBlade({ name: "OrderDetails", param: orderId });
 * const result = await callParent("reload");
 * closeSelf();
 * ```
 *
 * @example Outside blade (dashboard card)
 * ```ts
 * const { openBlade } = useBlade();
 * openBlade({ name: "OrderDetails", param: orderId });
 * ```
 */
export function useBlade<TOptions = Record<string, unknown>>(): UseBladeReturn<TOptions> {
    // Navigation — always available via inject (preferred) or singletons (fallback)
    const _stack: IBladeStack | undefined =
        (getCurrentInstance() ? inject(BladeStackKey, undefined) : undefined)
        ?? bladeStackInstance;
    const _messaging =
        (getCurrentInstance() ? inject(BladeMessagingKey, undefined) : undefined)
        ?? bladeMessagingInstance;

    if (!_stack || !_messaging) {
        throw new Error(
            "[vc-shell] useBlade() failed: BladeStack or BladeMessaging not available. " +
            "Ensure BladeNavigationPlugin (plugin-v2) is installed.",
        );
    }

    // After the guard above, these are guaranteed non-null
    const bladeStack = _stack;
    const messaging = _messaging;

    // Blade context — optional (via inject, no error if missing)
    const descriptor = getCurrentInstance()
        ? inject(BladeDescriptorKey, undefined)
        : undefined;

    // ── URL sync (lazy — only created if router available) ────────────────────
    let _urlSync: ReturnType<typeof createUrlSync> | undefined;

    function getUrlSync() {
        if (_urlSync) return _urlSync;
        const router = bladeNavigationInstance?.router;
        if (router) {
            _urlSync = createUrlSync(router, bladeStack);
        }
        return _urlSync;
    }

    // ── Identity (read-only) ────────────────────────────────────────────────
    const id = computed(() => {
        if (!descriptor) requireContext("id");
        return descriptor!.value.id;
    });
    const param = computed(() => {
        if (!descriptor) requireContext("param");
        return descriptor!.value.param;
    });
    const options = computed(() => {
        if (!descriptor) requireContext("options");
        return descriptor!.value.options as TOptions | undefined;
    });
    const query = computed(() => {
        if (!descriptor) requireContext("query");
        return descriptor!.value.query;
    });
    const closable = computed(() => {
        if (!descriptor) requireContext("closable");
        return descriptor!.value.parentId !== undefined;
    });
    const expanded = computed(() => {
        if (!descriptor) requireContext("expanded");
        const active = bladeStack.activeBlade.value;
        return active?.id === descriptor!.value.id;
    });
    const name = computed(() => {
        if (!descriptor) requireContext("name");
        return descriptor!.value.name;
    });

    // ── Blade Data ──────────────────────────────────────────────────────────

    let _bladeDataProvided = false;

    function provideBladeData(data: MaybeRef<Record<string, unknown>>): void {
        if (_bladeDataProvided) {
            console.warn(
                "[vc-shell] provideBladeData() called more than once in the same blade. " +
                "Only the first call takes effect.",
            );
            return;
        }
        _bladeDataProvided = true;

        const reactiveData = isRef(data) ? data : ref(data);
        provide(BladeDataKey, reactiveData);
    }

    // ── Navigation (works everywhere) ─────────────────────────────────────

    async function openBlade(event: BladeOpenEvent & { isWorkspace?: boolean }): Promise<void> {
        const { isWorkspace, ...bladeEvent } = event;

        if (isWorkspace) {
            // Workspace: close all blades, open as root
            await bladeStack.openWorkspace(bladeEvent);
        } else {
            const parentId = descriptor?.value.id;
            if (parentId) {
                // Inside blade: open as child
                await bladeStack.openBlade({ ...bladeEvent, parentId });
            } else {
                // Outside blade: open with active blade as parent (or workspace)
                await bladeStack.openBlade(bladeEvent);
            }
        }

        // URL sync
        const openedBlade = bladeStack.activeBlade.value;
        if (openedBlade?.url) {
            getUrlSync()?.syncUrlPush();
        }
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    async function closeSelf(): Promise<boolean> {
        if (!descriptor) requireContext("closeSelf()");
        const result = await bladeStack.closeBlade(descriptor!.value.id);
        if (!result) {
            // Blade was closed — sync URL
            getUrlSync()?.syncUrlReplace();
        }
        return result;
    }

    async function closeChildren(): Promise<void> {
        if (!descriptor) requireContext("closeChildren()");
        await bladeStack.closeChildren(descriptor!.value.id);
        getUrlSync()?.syncUrlReplace();
    }

    async function replaceWith(event: BladeOpenEvent): Promise<void> {
        if (!descriptor) requireContext("replaceWith()");
        await bladeStack.replaceCurrentBlade({
            ...event,
            parentId: descriptor!.value.parentId,
        });
        const openedBlade = bladeStack.activeBlade.value;
        if (openedBlade?.url) {
            getUrlSync()?.syncUrlReplace();
        }
    }

    async function coverWith(event: BladeOpenEvent): Promise<void> {
        if (!descriptor) requireContext("coverWith()");
        await bladeStack.coverCurrentBlade({
            ...event,
            parentId: descriptor!.value.parentId,
        });
        const openedBlade = bladeStack.activeBlade.value;
        if (openedBlade?.url) {
            getUrlSync()?.syncUrlPush();
        }
    }

    // ── Communication ───────────────────────────────────────────────────────

    async function callParent<T = unknown>(method: string, args?: unknown): Promise<T> {
        if (!descriptor) requireContext("callParent()");
        return messaging.callParent<T>(descriptor!.value.id, method, args);
    }

    function exposeToChildren(methods: Record<string, (...args: unknown[]) => unknown>): void {
        if (!descriptor) requireContext("exposeToChildren()");
        messaging.exposeToChildren(descriptor!.value.id, methods);
    }

    // ── Guards ───────────────────────────────────────────────────────────────

    function onBeforeClose(guard: () => Promise<boolean>): void {
        if (!descriptor) requireContext("onBeforeClose()");
        bladeStack.registerBeforeClose(descriptor!.value.id, guard);
    }

    // ── Error management ────────────────────────────────────────────────────

    function setError(error: unknown): void {
        if (!descriptor) requireContext("setError()");
        bladeStack.setBladeError(descriptor!.value.id, error);
    }

    function clearError(): void {
        if (!descriptor) requireContext("clearError()");
        bladeStack.clearBladeError(descriptor!.value.id);
    }

    // ── Lifecycle hooks ─────────────────────────────────────────────────────

    let _activatedRegistered = false;
    let _deactivatedRegistered = false;

    function onActivated(callback: () => void): void {
        if (!descriptor) requireContext("onActivated()");
        if (_activatedRegistered) {
            console.warn("[useBlade] onActivated() already registered in this blade.");
            return;
        }
        _activatedRegistered = true;
        watch(expanded, (val) => { if (val) callback(); });
    }

    function onDeactivated(callback: () => void): void {
        if (!descriptor) requireContext("onDeactivated()");
        if (_deactivatedRegistered) {
            console.warn("[useBlade] onDeactivated() already registered in this blade.");
            return;
        }
        _deactivatedRegistered = true;
        watch(expanded, (val) => { if (!val) callback(); });
    }

    return {
        id,
        param,
        options,
        query,
        closable,
        expanded,
        name,
        provideBladeData,
        openBlade,
        closeSelf,
        closeChildren,
        replaceWith,
        coverWith,
        callParent,
        exposeToChildren,
        onBeforeClose,
        onActivated,
        onDeactivated,
        setError,
        clearError,
    };
}
