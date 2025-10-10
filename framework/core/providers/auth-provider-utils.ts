import { IAuthProvider } from "../types/auth-provider";
import { PlatformAuthProvider } from "./platform-auth-provider";

/**
 * Check if the provider is a platform provider
 * Centralized logic for determining platform-specific features availability
 */
export function isPlatformProvider(provider: IAuthProvider | null | undefined): boolean {
  return provider instanceof PlatformAuthProvider;
}

/**
 * Check if platform-specific features should be enabled
 * This is the main function to use throughout the framework
 */
export function shouldEnablePlatformFeatures(provider: IAuthProvider | null | undefined): boolean {
  return isPlatformProvider(provider);
}

/**
 * Get a safe provider instance with fallback
 * Handles null/undefined cases gracefully
 */
export function getSafeProvider(provider: IAuthProvider | null | undefined): IAuthProvider | null {
  return provider || null;
}
