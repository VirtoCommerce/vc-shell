/**
 * Centralized typed mock factories for framework-wide test doubles.
 *
 * Import via: import { ... } from "@framework/test-mock-factories"
 *
 * Each factory returns the exact interface the real module exports,
 * with vi.fn() for functions, ref() for Refs, computed() for ComputedRefs.
 * Pass Partial overrides to customize defaults per test.
 *
 * @internal — for test files only; not part of the public framework API
 */
import { vi } from "vitest";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { UseSidebarStateReturn } from "@core/composables/useSidebarState";
import type { UseBladeReturn } from "@core/composables/useBlade";

// ── Sidebar State ─────────────────────────────────────────────────────────────

/**
 * Creates a fully-typed mock for useSidebarState / provideSidebarState.
 *
 * @example
 * const mockSidebar = createMockSidebarState();
 * vi.mock("@core/composables/useSidebarState", () => ({
 *   useSidebarState: () => mockSidebar,
 * }));
 */
export function createMockSidebarState(
  overrides: Partial<Record<keyof UseSidebarStateReturn, unknown>> = {},
): UseSidebarStateReturn {
  return {
    isPinned: ref(false),
    isHoverExpanded: ref(false),
    isMenuOpen: ref(false),
    isExpanded: computed(() => false),
    togglePin: vi.fn(),
    setHoverExpanded: vi.fn(),
    openMenu: vi.fn(),
    closeMenu: vi.fn(),
    ...overrides,
  } as UseSidebarStateReturn;
}

// ── Popup ─────────────────────────────────────────────────────────────────────

/**
 * Interface matching the return of usePopup().
 * Declared locally to avoid importing from the composable file
 * (which would pull in vue-i18n and other runtime dependencies).
 */
export interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
  showInfo(message: string | Ref<string>): void;
}

/**
 * Creates a fully-typed mock for usePopup().
 *
 * @example
 * const mockPopup = createMockPopup();
 * vi.mock("@core/composables/usePopup", () => ({
 *   usePopup: () => mockPopup,
 * }));
 */
export function createMockPopup(overrides: Partial<Record<keyof IUsePopup, unknown>> = {}): IUsePopup {
  return {
    open: vi.fn(),
    close: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(false),
    showError: vi.fn(),
    showInfo: vi.fn(),
    ...overrides,
  } as IUsePopup;
}

// ── Blade Return ──────────────────────────────────────────────────────────────

/**
 * Creates a fully-typed mock for useBlade().
 * Includes ALL fields from UseBladeReturn.
 *
 * @example
 * const mockBlade = createMockBladeReturn();
 * vi.mock("@core/composables/useBlade", () => ({
 *   useBlade: () => mockBlade,
 * }));
 */
export function createMockBladeReturn<TOptions = Record<string, unknown>>(
  overrides: Partial<Record<keyof UseBladeReturn<TOptions>, unknown>> = {},
): UseBladeReturn<TOptions> {
  return {
    // Identity (read-only)
    id: computed(() => "mock-blade-id"),
    param: computed(() => undefined),
    options: computed(() => undefined),
    query: computed(() => undefined),
    closable: computed(() => true),
    expanded: computed(() => false),
    name: computed(() => "MockBlade"),
    // Blade data
    provideBladeData: vi.fn(),
    // Navigation
    openBlade: vi.fn().mockResolvedValue(undefined),
    // Actions
    closeSelf: vi.fn().mockResolvedValue(false),
    closeChildren: vi.fn().mockResolvedValue(undefined),
    replaceWith: vi.fn().mockResolvedValue(undefined),
    coverWith: vi.fn().mockResolvedValue(undefined),
    // Communication
    callParent: vi.fn().mockResolvedValue(undefined),
    exposeToChildren: vi.fn(),
    // Guards
    onBeforeClose: vi.fn(),
    // Lifecycle
    onActivated: vi.fn(),
    onDeactivated: vi.fn(),
    // Error management
    setError: vi.fn(),
    clearError: vi.fn(),
    // Banner management
    addBanner: vi.fn().mockReturnValue("mock-banner-id"),
    removeBanner: vi.fn(),
    clearBanners: vi.fn(),
    ...overrides,
  } as UseBladeReturn<TOptions>;
}

// ── Re-exports from auth ──────────────────────────────────────────────────────

export { createMockUserManagement, createMockExternalProvider } from "@shell/auth/_test-utils/shared-mock-factories";
