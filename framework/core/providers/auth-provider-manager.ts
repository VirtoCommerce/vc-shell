import { IAuthProvider } from "../types/auth-provider";
import { PlatformAuthProvider } from "./platform-auth-provider";

/**
 * Global auth provider manager
 * Provides access to auth provider before Vue app context is available
 * This is necessary for early initialization scenarios where composables
 * are called before app.use(VirtoShellFramework)
 */
class AuthProviderManager {
  private provider: IAuthProvider | null = null;
  private defaultProvider: IAuthProvider | null = null;
  private configureWasCalled = false;

  /**
   * Set the global auth provider
   * Should be called via VirtoShellFramework.configure() before any composables
   * If custom provider is provided, it will replace the default
   */
  setProvider(provider: IAuthProvider): void {
    console.log("[AuthProviderManager] Setting auth provider:", provider.constructor.name);
    this.configureWasCalled = true;
    this.provider = provider;
  }

  /**
   * Get the global auth provider
   * Lazy-initializes default PlatformAuthProvider if no custom provider was set
   */
  getProvider(): IAuthProvider {
    // If custom provider was set, use it
    if (this.provider) {
      return this.provider;
    }

    // Lazy-initialize default platform provider only when needed (backward compatibility)
    if (!this.defaultProvider) {
      console.log("[AuthProviderManager] Lazy-initializing default PlatformAuthProvider");

      // Show deprecation warning only if configure() was never called
      if (!this.configureWasCalled) {
        console.warn(
          "[AuthProviderManager] DEPRECATION WARNING: " +
          "Automatic PlatformAuthProvider creation will be removed in a future version. " +
          "Please use VirtoShellFramework.configure({ authProvider }) explicitly before calling useUser()."
        );
      }

      this.defaultProvider = new PlatformAuthProvider();
    }

    return this.defaultProvider;
  }

  /**
   * Check if provider is available
   */
  hasProvider(): boolean {
    return this.provider !== null || this.defaultProvider !== null;
  }

  /**
   * Reset manager (for testing)
   */
  reset(): void {
    this.provider = null;
    this.defaultProvider = null;
    this.configureWasCalled = false;
  }
}

// Global singleton instance
export const authProviderManager = new AuthProviderManager();

