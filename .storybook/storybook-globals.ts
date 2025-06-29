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

// Export all mocks together for convenience
export const mockGlobals = {
  notification: mockNotification,
  AssetsManager: mockAssetsManager,
  // Add new objects here
};
