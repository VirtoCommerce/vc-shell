import { computed } from 'vue';

/**
 * Mocks for global objects used in Storybook
 *
 * If an error ReferenceError appears when starting Storybook for some object,
 * add it here and declare in preview-head.html
 */

// Mock for notifications
export const mockNotification = {
  success: () => {},
  error: () => {},
  warning: () => {},
  clearAll: () => {},
  remove: () => {},
  update: () => {},
};

// Mock for AssetsManager
export const mockAssetsManager = {
  // Empty object for the mock
};

// Mock for extension points (new API)
export const mockDefineExtensionPoint = (_name: string) => {
  return {
    components: computed(() => []),
    hasComponents: computed(() => false),
  };
};

export const mockUseExtensionPoint = (_name: string) => {
  return {
    add: () => {},
    remove: () => {},
  };
};

// Export all mocks together for convenience
export const mockGlobals = {
  notification: mockNotification,
  AssetsManager: mockAssetsManager,
  defineExtensionPoint: mockDefineExtensionPoint,
  useExtensionPoint: mockUseExtensionPoint,
  // Add new objects here
};
