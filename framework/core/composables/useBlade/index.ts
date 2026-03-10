import { inject, computed, type ComputedRef } from "vue";
import { BladeInstance } from "@framework/injection-keys";
import {
    BladeDescriptorKey,
    BladeStackKey,
    BladeMessagingKey,
} from "@shared/components/blade-navigation/types";
import type {
    BladeDescriptor,
    BladeOpenEvent,
    IBladeStack,
    IBladeMessaging,
    IBladeInstance,
} from "@shared/components/blade-navigation/types";

/** Type alias for the return value of useBlade() */
export type UseBladeReturn = ComputedRef<IBladeInstance>;

export interface UseBladeContextReturn {
  // Identity (read-only)
  readonly id: ComputedRef<string>;
  readonly param: ComputedRef<string | undefined>;
  readonly options: ComputedRef<Record<string, unknown> | undefined>;
  readonly query: ComputedRef<Record<string, string> | undefined>;
  readonly closable: ComputedRef<boolean>;
  readonly expanded: ComputedRef<boolean>;
  // Actions
  openBlade(event: BladeOpenEvent): Promise<void>;
  closeSelf(): Promise<boolean>;
  replaceWith(event: BladeOpenEvent): Promise<void>;
  // Communication
  callParent<T = unknown>(method: string, args?: unknown): Promise<T>;
  exposeToChildren(methods: Record<string, (...args: unknown[]) => unknown>): void;
  // Guards
  onBeforeClose(guard: () => Promise<boolean>): void;
  // Error management
  setError(error: unknown): void;
  clearError(): void;
}

/**
 * Composable for accessing the current blade instance (legacy API).
 *
 * Returns a ComputedRef<IBladeInstance> — the same type as before.
 * For the new extended API with actions (openBlade, closeSelf, etc.),
 * use `useBladeContext()` instead.
 *
 * @deprecated Use useBladeContext() instead.
 * @returns The current blade instance (ComputedRef)
 */
export function useBlade(): UseBladeReturn {
    const blade = inject(BladeInstance);

    if (!blade) {
        throw new Error(
            "[vc-shell] useBlade() called outside blade context. " +
            "Wrap your component with VcBlade or use useBladeContext() inside a blade.",
        );
    }
    return blade;
}

/**
 * Extended blade context composable (new API).
 *
 * Provides identity (id, param, options), actions (openBlade, closeSelf),
 * communication (callParent, exposeToChildren), guards, and error management.
 *
 * Must be called inside a component rendered by VcBladeSlot (new render layer).
 * Falls back gracefully when BladeDescriptor is not yet provided (old render layer).
 *
 * @example
 * ```ts
 * const { param, options, openBlade, closeSelf, callParent } = useBladeContext();
 * openBlade({ name: "OrderDetails", param: orderId });
 * const result = await callParent("reload");
 * closeSelf();
 * ```
 */
export function useBladeContext(): UseBladeContextReturn {
    const _descriptor = inject(BladeDescriptorKey);
    const _bladeStack = inject(BladeStackKey);
    const _messaging = inject(BladeMessagingKey);

    if (!_descriptor || !_bladeStack || !_messaging) {
        throw new Error(
            "[vc-shell] useBladeContext() called outside blade context. " +
            "Ensure the component is rendered inside VcBladeSlot.",
        );
    }

    // Assign to non-optional consts after the guard (TypeScript narrows)
    const descriptor = _descriptor;
    const bladeStack = _bladeStack;
    const messaging = _messaging;

    // ── Identity (read-only) ────────────────────────────────────────────────
    const id = computed(() => descriptor.value.id);
    const param = computed(() => descriptor.value.param);
    const options = computed(() => descriptor.value.options);
    const query = computed(() => descriptor.value.query);
    const closable = computed(() => descriptor.value.parentId !== undefined);
    const expanded = computed(() => {
        const active = bladeStack.activeBlade.value;
        return active?.id === descriptor.value.id;
    });

    // ── Actions ─────────────────────────────────────────────────────────────

    async function openBlade(event: BladeOpenEvent): Promise<void> {
        return bladeStack.openBlade({
            ...event,
            parentId: descriptor.value.id, // auto-set parent
        });
    }

    async function closeSelf(): Promise<boolean> {
        return bladeStack.closeBlade(descriptor.value.id);
    }

    async function replaceWith(event: BladeOpenEvent): Promise<void> {
        return bladeStack.replaceCurrentBlade({
            ...event,
            parentId: descriptor.value.parentId,
        });
    }

    // ── Communication ───────────────────────────────────────────────────────

    async function callParent<T = unknown>(method: string, args?: unknown): Promise<T> {
        return messaging.callParent<T>(descriptor.value.id, method, args);
    }

    function exposeToChildren(methods: Record<string, (...args: unknown[]) => unknown>): void {
        messaging.exposeToChildren(descriptor.value.id, methods);
    }

    // ── Guards ───────────────────────────────────────────────────────────────

    function onBeforeClose(guard: () => Promise<boolean>): void {
        bladeStack.registerBeforeClose(descriptor.value.id, guard);
    }

    // ── Error management ────────────────────────────────────────────────────

    function setError(error: unknown): void {
        bladeStack.setBladeError(descriptor.value.id, error);
    }

    function clearError(): void {
        bladeStack.clearBladeError(descriptor.value.id);
    }

    return {
        // Identity
        id,
        param,
        options,
        query,
        closable,
        expanded,

        // Actions
        openBlade,
        closeSelf,
        replaceWith,

        // Communication
        callParent,
        exposeToChildren,

        // Guards
        onBeforeClose,

        // Error management
        setError,
        clearError,
    };
}
