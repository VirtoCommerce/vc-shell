/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef } from "vue";
import {
  SignInResult,
  IUserDetail,
  ISecurityResult,
  ILoginType,
  IIdentityResult,
} from "../api/platform";
import { RequestPasswordResult } from "./index";

/**
 * Interface for authentication provider
 * Allows custom authentication implementations while maintaining compatibility with all framework pages
 */
export interface IAuthProvider {
  // Core properties
  user: ComputedRef<IUserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAuthenticated: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;

  // Core methods
  loadUser(): Promise<IUserDetail>;
  signIn(
    username: string,
    password: string,
  ): Promise<SignInResult | { succeeded: boolean; error?: any; status?: number }>;
  signOut(): Promise<void>;

  // Password management methods
  validateToken(userId: string, token: string): Promise<boolean>;
  validatePassword(password: string): Promise<IIdentityResult>;
  resetPasswordByToken(userId: string, password: string, token: string): Promise<ISecurityResult>;
  requestPasswordReset(loginOrEmail: string): Promise<RequestPasswordResult>;
  changeUserPassword(oldPassword: string, newPassword: string): Promise<ISecurityResult | undefined>;

  // Additional methods
  getLoginType(): Promise<ILoginType[]>;
}
