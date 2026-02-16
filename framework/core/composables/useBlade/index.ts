import { inject, computed } from "vue";
import { BladeInstance } from "../../../injection-keys";
import {
    BladeDescriptorKey,
    BladeStackKey,
    BladeMessagingKey,
} from "../../../shared/components/blade-navigation/types";
import type {
    BladeDescriptor,
    BladeOpenEvent,
    IBladeStack,
    IBladeMessaging,
} from "../../../shared/components/blade-navigation/types";

/**
 * Composable for accessing the current blade instance (legacy API).
 *
 * Returns a ComputedRef<IBladeInstance> — the same type as before.
 * For the new extended API with actions (openBlade, closeSelf, etc.),
 * use `useBladeContext()` instead.
 *
 * @returns The current blade instance (ComputedRef)
 */
export function useBlade() {
    const blade = inject(BladeInstance);

    if (!blade) {
        throw new Error("Blade instance not found in the current context");
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
export function useBladeContext() {
    const _descriptor = inject(BladeDescriptorKey);
    const _bladeStack = inject(BladeStackKey);
    const _messaging = inject(BladeMessagingKey);

    if (!_descriptor || !_bladeStack || !_messaging) {
        throw new Error(
            "[useBladeContext] Missing required injections. " +
            "Ensure the component is rendered inside VcBladeSlot (new render layer).",
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

    function exposeToChildren(methods: Record<string, (...args: any[]) => any>): void {
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
