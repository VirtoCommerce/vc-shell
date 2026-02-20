/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, Ref, ref, ComputedRef } from "vue";
import {
  UserDetail,
  SecurityClient,
  ResetPasswordConfirmRequest,
  SecurityResult,
  ValidatePasswordResetTokenRequest,
  IdentityResult,
  ChangePasswordRequest,
  LoginType,
  LoginRequest,
  SignInResult,
} from "@core/api/platform";
import { RequestPasswordResult } from "@core/types";
import { createSharedComposable } from "@vueuse/core";
import { useExternalProvider } from "@shared/components/sign-in/useExternalProvider";
import { createLogger } from "@core/utilities";

export interface TokenData {
  token: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
}

const AUTH_STORAGE_KEY = "vc_auth_data";

const logger = createLogger("use-user");

// Interface for the full internal API provided by _createInternalUserLogic
export interface IUserInternalAPI {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<UserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult | undefined>;
  getLoginType: () => Promise<LoginType[]>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: ComputedRef<boolean>;
}

export interface IAppUserAPI {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAuthenticated: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<UserDetail>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const user: Ref<UserDetail | undefined> = ref();

function readAuthData(): TokenData | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as TokenData;
    }
  } catch (e) {
    logger.error("Failed to read auth data from storage:", e);
  }
  return null;
}

function storeAuthData(data: TokenData): void {
  try {
    logger.debug("storeAuthData - Saving:", data);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    logger.debug("storeAuthData - Saved successfully");
  } catch (e) {
    logger.error("Failed to store auth data:", e);
  }
}

function clearAuthData(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    logger.error("Failed to clear auth data:", e);
  }
}

// Direct fetch to /connect/token endpoint
async function fetchToken(params: Record<string, string>): Promise<TokenData | null> {
  try {
    const body = new URLSearchParams(params).toString();

    const response = await fetch("/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error("fetchToken - HTTP error:", response.status, response.statusText, errorBody);
      return null;
    }

    const data = await response.json();
    logger.debug("fetchToken - Response:", data);

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in;

    if (data.error || !accessToken) {
      logger.error("fetchToken - Error:", data.error_description || data.error || "No access token");
      return null;
    }

    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;

    return {
      token: accessToken,
      access_token: accessToken,
      refresh_token: refreshToken ?? null,
      expires_at: expiresAt,
    };
  } catch (e) {
    logger.error("fetchToken - Exception:", e);
    return null;
  }
}

export function _createInternalUserLogic(): IUserInternalAPI {
  const loading: Ref<boolean> = ref(false);
  const authData: Ref<TokenData | null> = ref(null);

  const { storage: externalSignInStorage, signOut: externalSignOut } = useExternalProvider();

  const securityClient = new SecurityClient();

  const isAuthenticated = computed(() => user.value?.userName != null);

  async function validateToken(userId: string, token: string): Promise<boolean> {
    let result = false;
    try {
      loading.value = true;
      result = await securityClient.validatePasswordResetToken(userId, {
        token,
      } as ValidatePasswordResetTokenRequest);
    } catch (e) {
      //TODO: log error
    } finally {
      loading.value = false;
    }
    return result;
  }

  async function validatePassword(password: string): Promise<IdentityResult> {
    return securityClient.validatePassword(password);
  }

  async function resetPasswordByToken(userId: string, password: string, token: string): Promise<SecurityResult> {
    return securityClient.resetPasswordByToken(userId, {
      newPassword: password,
      token,
    } as ResetPasswordConfirmRequest);
  }

  async function signIn(
    username: string,
    password: string,
  ): Promise<SignInResult | { succeeded: boolean; error?: any; status?: number }> {
    logger.debug("signIn - Entry point");
    try {
      loading.value = true;

      // First do the standard login to set cookies/session
      const result = await securityClient.login(new LoginRequest({ userName: username, password }));
      logger.debug("signIn - Cookie login completed:", result);

      // Then get OAuth token for API calls (direct fetch, bypasses API client)
      // Request offline_access scope to get refresh_token for automatic token renewal
      logger.debug("signIn - Requesting token...");
      const tokenData = await fetchToken({
        grant_type: "password",
        username,
        password,
        scope: "offline_access",
      });

      if (tokenData) {
        authData.value = tokenData;
        storeAuthData(authData.value);
        logger.debug("signIn - Token saved:", authData.value);
      }

      // Load current user info
      const userInfo = await securityClient.getCurrentUser();
      if (userInfo) {
        user.value = userInfo;
        return result;
      }

      throw { succeeded: false };
    } catch (e: any) {
      logger.error("signIn failed:", e);
      return { succeeded: false, error: e.message, status: e.status };
    } finally {
      loading.value = false;
    }
  }

  async function signOut(): Promise<void> {
    logger.debug("signOut - Entry point");

    user.value = undefined;

    // Clear stored auth data
    clearAuthData();
    authData.value = null;

    if (externalSignInStorage.value?.providerType) {
      await externalSignOut(externalSignInStorage.value.providerType);
    } else {
      securityClient.logout();
    }
  }

  async function loadUser(): Promise<UserDetail> {
    logger.debug("loadUser - Entry point");

    try {
      loading.value = true;
      user.value = await securityClient.getCurrentUser();
      await getAccessToken();
      logger.debug("User details loaded:", user.value);
    } catch (e: any) {
      logger.error("loadUser failed:", e);
    } finally {
      loading.value = false;
    }

    return { ...user.value } as UserDetail;
  }

  async function requestPasswordReset(loginOrEmail: string): Promise<RequestPasswordResult> {
    try {
      loading.value = true;
      await securityClient.requestPasswordReset(loginOrEmail);
      return { succeeded: true };
    } catch (e) {
      //TODO: log error
      return { succeeded: false, error: e as string };
    } finally {
      loading.value = false;
    }
  }

  async function changeUserPassword(oldPassword: string, newPassword: string): Promise<SecurityResult | undefined> {
    let result;

    try {
      loading.value = true;
      const command = new ChangePasswordRequest({
        oldPassword,
        newPassword,
      });

      result = await securityClient.changeCurrentUserPassword(command);
    } catch (e: any) {
      return { succeeded: false, errors: [e.message] } as SecurityResult;
    } finally {
      loading.value = false;
    }

    return result;
  }

  async function getLoginType() {
    let result: LoginType[] | null = null;
    try {
      result = await securityClient.getLoginTypes();
    } catch (e) {
      logger.error("getLoginType failed:", e);
      throw e;
    }

    return result;
  }

  // Buffer time in ms - refresh token this much before actual expiration
  const TOKEN_REFRESH_BUFFER_MS = 60 * 1000; // 60 seconds

  async function getAccessToken(): Promise<string | null> {
    logger.debug("getAccessToken - Entry point");

    // Load auth data from storage if not yet loaded
    if (!authData.value) {
      authData.value = readAuthData();
    }

    // No auth data available
    if (!authData.value) {
      logger.debug("getAccessToken - No auth data available");
      return null;
    }

    // Check if token is expired or about to expire (with buffer)
    const now = Date.now();
    const expiresAt = authData.value.expires_at;
    const shouldRefresh = expiresAt ? now >= expiresAt - TOKEN_REFRESH_BUFFER_MS : false;

    logger.debug("getAccessToken - Token status:", {
      hasToken: !!authData.value.access_token,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "not set",
      now: new Date(now).toISOString(),
      shouldRefresh,
      hasRefreshToken: !!authData.value.refresh_token,
    });

    if (shouldRefresh && authData.value.refresh_token) {
      logger.debug("getAccessToken - Token expired or expiring soon, attempting refresh");

      const tokenData = await fetchToken({
        grant_type: "refresh_token",
        refresh_token: authData.value.refresh_token,
        scope: "offline_access",
      });

      if (tokenData) {
        // Keep old refresh_token if new one not provided
        tokenData.refresh_token = tokenData.refresh_token ?? authData.value.refresh_token;
        authData.value = tokenData;
        storeAuthData(authData.value);
        logger.debug("getAccessToken - Token refreshed successfully, new expiry:", {
          expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : "not set",
        });
      } else {
        // Refresh failed - log error but return existing token (it might still work)
        // Don't clear auth data - let the API call fail naturally if token is truly invalid
        logger.warn("getAccessToken - Failed to refresh token, returning existing token");
      }
    }

    return authData.value?.access_token ?? authData.value?.token ?? null;
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAdministrator: computed(() => user.value?.isAdministrator),
    isAuthenticated,
    loadUser,
    signIn,
    signOut,
    validateToken,
    validatePassword,
    resetPasswordByToken,
    requestPasswordReset,
    changeUserPassword,
    getLoginType,
    getAccessToken,
  };
}

export const useUser = createSharedComposable((): IAppUserAPI => {
  const internals = _createInternalUserLogic();
  return {
    user: internals.user,
    loading: internals.loading,
    isAuthenticated: internals.isAuthenticated,
    isAdministrator: internals.isAdministrator,
    loadUser: internals.loadUser,
    signOut: internals.signOut,
    getAccessToken: internals.getAccessToken,
  };
});
