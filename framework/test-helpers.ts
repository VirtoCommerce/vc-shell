/**
 * Shared test utilities for composable testing.
 *
 * Import via: import { ... } from "@framework/test-helpers"
 *
 * @internal — for test files only; not part of the public framework API
 */
import { computed, defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { expect, vi } from "vitest";
import {
  BladeDescriptorKey,
  BladeStackKey,
  BladeMessagingKey,
} from "@shared/components/blade-navigation/types";
import type { IBladeStack, IBladeMessaging } from "@shared/components/blade-navigation/types";

// ── Generic composable wrapper ─────────────────────────────────────────────────

/**
 * Mounts a minimal component that calls setupFn inside setup().
 * Returns the composable result and the wrapper for lifecycle control.
 *
 * @example
 * const { result, wrapper } = mountWithSetup(() => useMyComposable());
 * expect(result.someRef.value).toBe(expected);
 * wrapper.unmount();
 */
export function mountWithSetup<T>(setupFn: () => T) {
  let result: T;
  const TestComponent = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const wrapper = mount(TestComponent);
  return { result: result!, wrapper };
}

// ── Mock blade stack / messaging factories ────────────────────────────────────

/**
 * Creates an IBladeStack-shaped mock with vi.fn() for all methods.
 * Use as the stack argument in mountWithBladeContext or in vi.mock().
 */
export function createMockBladeStack(): IBladeStack {
  return {
    blades: ref([]),
    workspace: ref(undefined),
    activeBlade: ref(undefined),
    openBlade: vi.fn().mockResolvedValue(undefined),
    openWorkspace: vi.fn().mockResolvedValue(undefined),
    closeBlade: vi.fn().mockResolvedValue(false),
    closeChildren: vi.fn().mockResolvedValue(undefined),
    replaceCurrentBlade: vi.fn().mockResolvedValue(undefined),
    coverCurrentBlade: vi.fn().mockResolvedValue(undefined),
    registerBeforeClose: vi.fn(),
    setBladeError: vi.fn(),
    clearBladeError: vi.fn(),
  } as unknown as IBladeStack;
}

/**
 * Creates an IBladeMessaging-shaped mock with vi.fn() for all methods.
 */
export function createMockBladeMessaging(): IBladeMessaging {
  return {
    callParent: vi.fn().mockResolvedValue(undefined),
    exposeToChildren: vi.fn(),
  } as unknown as IBladeMessaging;
}

// ── Blade context provider wrapper ────────────────────────────────────────────

export interface BladeContextOverrides {
  descriptor?: Record<string, unknown>;
  stack?: IBladeStack;
  messaging?: IBladeMessaging;
}

/**
 * Mounts a component that calls setupFn inside a blade context.
 * Provides BladeDescriptorKey, BladeStackKey, and BladeMessagingKey via
 * a parent component, so the inner composable can inject them.
 *
 * @example
 * const { result, mockStack } = mountWithBladeContext(
 *   () => useBlade(),
 *   { descriptor: { id: "blade-42" } }
 * );
 * expect(result.id.value).toBe("blade-42");
 */
export function mountWithBladeContext<T>(setupFn: () => T, overrides?: BladeContextOverrides) {
  const descriptorData = ref({
    id: "test-blade",
    parentId: "root",
    name: "TestBlade",
    param: undefined,
    options: undefined,
    query: undefined,
    visible: true,
    error: undefined,
    title: undefined,
    url: undefined,
    ...overrides?.descriptor,
  });
  const mockDescriptor = computed(() => descriptorData.value);
  const mockStack = overrides?.stack ?? createMockBladeStack();
  const mockMessaging = overrides?.messaging ?? createMockBladeMessaging();

  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      provide(BladeDescriptorKey, mockDescriptor);
      provide(BladeStackKey, mockStack);
      provide(BladeMessagingKey, mockMessaging);
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper, mockStack, mockMessaging };
}

// ── No-blade-context wrapper ────────────────────────────────────────────────

/**
 * Mounts a component WITHOUT blade descriptor but WITH BladeStack/Messaging
 * provided via a parent component. Simulates a component inside the app
 * (where the plugin is installed) but outside any VcBladeSlot.
 *
 * Use this to test composables that should work outside blade context
 * (e.g. useBlade() called from a dashboard card).
 *
 * @example
 * const { result, mockStack } = mountWithoutBladeContext(() => useBlade());
 * // openBlade works, closeSelf throws
 */
export function mountWithoutBladeContext<T>(
  setupFn: () => T,
  overrides?: { stack?: IBladeStack; messaging?: IBladeMessaging },
) {
  const mockStack = overrides?.stack ?? createMockBladeStack();
  const mockMessaging = overrides?.messaging ?? createMockBladeMessaging();

  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      // Provide stack and messaging but NOT BladeDescriptorKey
      provide(BladeStackKey, mockStack);
      provide(BladeMessagingKey, mockMessaging);
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper, mockStack, mockMessaging };
}

// ── Vue warning assertion ─────────────────────────────────────────────────────

/**
 * Runs fn, then asserts that no `[Vue warn]` messages were emitted.
 * Spies console.warn for the duration of fn and restores it afterward.
 *
 * @example
 * await expectNoVueWarnings(async () => {
 *   const { wrapper } = mountWithSetup(() => useMyComposable());
 *   await wrapper.vm.$nextTick();
 *   wrapper.unmount();
 * });
 */
export async function expectNoVueWarnings(fn: () => void | Promise<void>): Promise<void> {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await fn();
  } finally {
    const vueWarnings = warnSpy.mock.calls.filter((args) => String(args[0]).includes("[Vue warn]"));
    warnSpy.mockRestore();
    expect(vueWarnings).toHaveLength(0);
  }
}
