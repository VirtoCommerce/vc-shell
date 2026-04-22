import { vi } from "vitest";
import { ref, computed } from "vue";
import type { UseUserManagementReturn } from "@core/composables/useUserManagement";
import type { IUseExternalProvider } from "@core/composables/useExternalProvider";

/**
 * Creates a fully-typed mock for useUserManagement.
 * All fields match UseUserManagementReturn — TypeScript will error if the interface changes.
 * Pass overrides for fields your test needs to control.
 */
export function createMockUserManagement(
  overrides: Partial<Record<keyof UseUserManagementReturn, unknown>> = {},
): UseUserManagementReturn {
  return {
    user: computed(() => undefined),
    loading: computed(() => false),
    isAdministrator: computed(() => false),
    isAuthenticated: computed(() => false),
    validateToken: vi.fn().mockResolvedValue(true),
    validatePassword: vi.fn().mockResolvedValue({ errors: [] }),
    resetPasswordByToken: vi.fn().mockResolvedValue({ succeeded: true }),
    getLoginType: vi.fn().mockResolvedValue([]),
    loadUser: vi.fn().mockResolvedValue({}),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    changeUserPassword: vi.fn().mockResolvedValue({ succeeded: true }),
    signIn: vi.fn().mockResolvedValue({ succeeded: true }),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as UseUserManagementReturn;
}

/**
 * Creates a fully-typed mock for useExternalProvider.
 */
export function createMockExternalProvider(
  overrides: Partial<Record<keyof IUseExternalProvider, unknown>> = {},
): IUseExternalProvider {
  return {
    storage: ref({}),
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    getProviders: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as IUseExternalProvider;
}
