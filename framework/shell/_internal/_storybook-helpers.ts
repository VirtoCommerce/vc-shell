import { defineComponent, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserManagement } from "@core/composables/useUserManagement";
import { IdentityResult, SecurityResult, SignInResult } from "@core/api/platform";

/**
 * Intercepts window.fetch for platform API endpoints that don't exist in Storybook.
 * Returns safe empty responses so composables like useSettings don't throw.
 */
export function mockPlatformApiFetch() {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // useSettings → GET /api/platform/settings/ui/customization
    if (url.includes("/api/platform/settings/ui/customization")) {
      return new Response(JSON.stringify({ defaultValue: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch.call(window, input, init);
  } as typeof fetch;

  onUnmounted(() => {
    window.fetch = originalFetch;
  });
}

/**
 * Patches useUserManagement methods with safe no-op/success stubs
 * and ensures auth-related routes exist for router.push() calls.
 */
export function patchUserManagement() {
  const userManagement = useUserManagement();
  const router = useRouter();

  const originals = {
    signIn: userManagement.signIn,
    signOut: userManagement.signOut,
    validateToken: userManagement.validateToken,
    validatePassword: userManagement.validatePassword,
    resetPasswordByToken: userManagement.resetPasswordByToken,
    requestPasswordReset: userManagement.requestPasswordReset,
    changeUserPassword: userManagement.changeUserPassword,
  };

  userManagement.signIn = async () => new SignInResult({ succeeded: true });
  userManagement.signOut = async () => {};
  userManagement.validateToken = async () => true;
  userManagement.validatePassword = async () => new IdentityResult({ succeeded: true, errors: [] });
  userManagement.resetPasswordByToken = async () => new SecurityResult({ succeeded: true, errors: [] });
  userManagement.requestPasswordReset = async () => ({ succeeded: true });
  userManagement.changeUserPassword = async () => new SecurityResult({ succeeded: true, errors: [] });

  for (const name of ["Login", "ForgotPassword", "ChangePassword"] as const) {
    if (!router.hasRoute(name)) {
      router.addRoute({
        name,
        path: `/${name.toLowerCase()}`,
        component: defineComponent({ template: "<div />" }),
      });
    }
  }

  onUnmounted(() => {
    Object.assign(userManagement, originals);
  });
}
