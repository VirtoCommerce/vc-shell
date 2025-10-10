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
} from "../api/platform";
import { RequestPasswordResult } from "../types";
import { useExternalProvider } from "../../shared/components/sign-in/useExternalProvider";
import { IAuthProvider } from "../types/auth-provider";

const DEMO_USER = {
  id: "demo_user_id",
  userName: "DEMO_USER",
  isAdministrator: true,
} as UserDetail;

/**
 * Platform-based authentication provider
 * Implements authentication using VirtoCommerce Platform API
 */
export class PlatformAuthProvider implements IAuthProvider {
  private _user: Ref<UserDetail | undefined> = ref();
  private _loading: Ref<boolean> = ref(false);
  private securityClient: SecurityClient;
  private externalSignInStorage: ReturnType<typeof useExternalProvider>["storage"];
  private externalSignOut: ReturnType<typeof useExternalProvider>["signOut"];

  constructor() {
    console.log("🔐 [PlatformAuthProvider] Constructor called - using PLATFORM authentication");
    this.securityClient = new SecurityClient();
    const { storage, signOut } = useExternalProvider();
    this.externalSignInStorage = storage;
    this.externalSignOut = signOut;
  }

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

  async validateToken(userId: string, token: string): Promise<boolean> {
    let result = false;
    try {
      this._loading.value = true;
      result = await this.securityClient.validatePasswordResetToken(userId, {
        token,
      } as ValidatePasswordResetTokenRequest);
    } catch (e) {
      //TODO: log error
    } finally {
      this._loading.value = false;
    }
    return result;
  }

  async validatePassword(password: string): Promise<IdentityResult> {
    return this.securityClient.validatePassword(password);
  }

  async resetPasswordByToken(userId: string, password: string, token: string): Promise<SecurityResult> {
    return this.securityClient.resetPasswordByToken(userId, {
      newPassword: password,
      token,
    } as ResetPasswordConfirmRequest);
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<SignInResult | { succeeded: boolean; error?: any; status?: number }> {
    console.debug(`[@vc-shell/framework#PlatformAuthProvider:signIn] - Entry point`);

    // Handle demo mode for platform provider
    if (window.__DEMO_MODE__) {
      console.warn("[PlatformAuthProvider] Running in DEMO mode - authentication is mocked");
      this._user.value = DEMO_USER as UserDetail;
      return { succeeded: true } as SignInResult;
    }

    try {
      this._loading.value = true;
      const result = await this.securityClient.login(new LoginRequest({ userName: username, password }));
      return await this.securityClient
        .getCurrentUser()
        .then((res) => {
          if (res) {
            this._user.value = res;
            return result;
          }
          throw { succeeded: false };
        })
        .catch((e) => {
          throw e;
        });
    } catch (e: any) {
      //TODO: log error
      console.log(e);
      return { succeeded: false, error: e.message, status: e.status };
    } finally {
      this._loading.value = false;
    }
  }

  async signOut(): Promise<void> {
    console.debug(`[@vc-shell/framework#PlatformAuthProvider:signOut] - Entry point`);

    this._user.value = undefined;

    if (this.externalSignInStorage.value?.providerType) {
      await this.externalSignOut(this.externalSignInStorage.value.providerType);
    } else {
      this.securityClient.logout();
    }
  }

  async loadUser(): Promise<UserDetail> {
    console.debug(`[@vc-shell/framework#PlatformAuthProvider:loadUser] - Entry point`);

    // Handle demo mode for platform provider
    if (window.__DEMO_MODE__) {
      console.warn(
        "[PlatformAuthProvider] Running in DEMO mode. All API calls are disabled. Please add APP_PLATFORM_URL to your application's .env file to enable API calls.",
      );
      this._user.value = DEMO_USER as UserDetail;
      return { ...this._user.value } as UserDetail;
    }

    try {
      this._loading.value = true;
      this._user.value = await this.securityClient.getCurrentUser();
      console.log("[PlatformAuthProvider]: an user details has been loaded", this._user.value);
    } catch (e: any) {
      console.error(e);
    } finally {
      this._loading.value = false;
    }

    return { ...this._user.value } as UserDetail;
  }

  async requestPasswordReset(loginOrEmail: string): Promise<RequestPasswordResult> {
    try {
      this._loading.value = true;
      await this.securityClient.requestPasswordReset(loginOrEmail);
      return { succeeded: true };
    } catch (e) {
      //TODO: log error
      return { succeeded: false, error: e as string };
    } finally {
      this._loading.value = false;
    }
  }

  async changeUserPassword(oldPassword: string, newPassword: string): Promise<SecurityResult | undefined> {
    let result;

    try {
      this._loading.value = true;
      const command = new ChangePasswordRequest({
        oldPassword,
        newPassword,
      });

      result = await this.securityClient.changeCurrentUserPassword(command);
    } catch (e: any) {
      return { succeeded: false, errors: [e.message] } as SecurityResult;
    } finally {
      this._loading.value = false;
    }

    return result;
  }

  async getLoginType(): Promise<LoginType[]> {
    let result: LoginType[] | null = null;
    try {
      result = await this.securityClient.getLoginTypes();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return result;
  }
}

