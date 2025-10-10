/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Example Custom Authentication Provider
 *
 * This is an example implementation showing how to create a custom authentication provider.
 * You can use this as a template to implement your own authentication logic.
 *
 * @example
 * ```typescript
 * import { CustomAuthProvider } from './auth/custom-provider';
 *
 * const customAuthProvider = new CustomAuthProvider();
 *
 * app.use(VirtoShellFramework, {
 *   router,
 *   authProvider: customAuthProvider,
 *   i18n: { ... }
 * });
 * ```
 */

import { computed, Ref, ref, ComputedRef } from "vue";
import {
  UserDetail,
  SecurityResult,
  IdentityResult,
  LoginType,
  SignInResult,
} from "../api/platform";
import { RequestPasswordResult } from "../types";
import { IAuthProvider } from "../types/auth-provider";

export class CustomAuthProvider implements IAuthProvider {

  private _user: Ref<UserDetail | undefined> = ref();
  private _loading: Ref<boolean> = ref(false);

  get user(): ComputedRef<UserDetail | undefined> {
    return computed(() => this._user.value);
  }

  get loading(): ComputedRef<boolean> {
    return computed(() => this._loading.value);
  }

  get isAuthenticated(): ComputedRef<boolean> {
    return computed(() => this._user.value?.userName != null);
  }

  get isAdministrator(): ComputedRef<boolean | undefined> {
    return computed(() => this._user.value?.isAdministrator);
  }

  async loadUser(): Promise<UserDetail> {
    // Implement your custom user loading logic
    // Example: Load from localStorage, custom API, etc.
    console.debug("[CustomAuthProvider] Loading user...");

    this._loading.value = true;

    try {
      // Example: Load from localStorage
      const storedUser = localStorage.getItem("customUser");
      if (storedUser) {
        this._user.value = JSON.parse(storedUser) as UserDetail;
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      this._loading.value = false;
    }

    return { ...this._user.value } as UserDetail;
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<SignInResult | { succeeded: boolean; error?: any; status?: number }> {
    console.debug("[CustomAuthProvider] Signing in...");

    this._loading.value = true;

    try {
      // Implement your custom sign-in logic
      // Example: Validate against local file, custom API, etc.

      // Example implementation:
      if (username === "demo" && password === "demo") {
        this._user.value = {
          userName: username,
          isAdministrator: true,
          // ... other user properties
        } as UserDetail;

        // Store user in localStorage
        localStorage.setItem("customUser", JSON.stringify(this._user.value));

        return { succeeded: true } as SignInResult;
      }

      return { succeeded: false, error: "Invalid credentials" };
    } catch (e: any) {
      console.error("Sign in failed:", e);
      return { succeeded: false, error: e.message };
    } finally {
      this._loading.value = false;
    }
  }

  async signOut(): Promise<void> {
    console.debug("[CustomAuthProvider] Signing out...");

    this._user.value = undefined;
    localStorage.removeItem("customUser");
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    // Implement your custom token validation logic
    console.debug("[CustomAuthProvider] Validating token...");
    return false;
  }

  async validatePassword(password: string): Promise<IdentityResult> {
    // Implement your custom password validation logic
    console.debug("[CustomAuthProvider] Validating password...");
    return { succeeded: true } as IdentityResult;
  }

  async resetPasswordByToken(
    userId: string,
    password: string,
    token: string,
  ): Promise<SecurityResult> {
    // Implement your custom password reset logic
    console.debug("[CustomAuthProvider] Resetting password...");
    return { succeeded: true } as SecurityResult;
  }

  async requestPasswordReset(loginOrEmail: string): Promise<RequestPasswordResult> {
    // Implement your custom password reset request logic
    console.debug("[CustomAuthProvider] Requesting password reset...");
    return { succeeded: true };
  }

  async changeUserPassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<SecurityResult | undefined> {
    // Implement your custom password change logic
    console.debug("[CustomAuthProvider] Changing password...");
    return { succeeded: true } as SecurityResult;
  }

  async getLoginType(): Promise<LoginType[]> {
    // Return supported login types for your custom provider
    console.debug("[CustomAuthProvider] Getting login types...");
    return [];
  }
}

