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

// Mock for extension points
export const mockUseExtensionSlot = (_slotName: string) => {
  return {
    components: computed(() => []),
    addComponent: () => {},
    removeComponent: () => {},
    hasComponents: computed(() => false),
  };
};

export const mockUseExtensionData = (_namespace: string) => {
  return {
    data: computed(() => ({})),
    updateData: () => {},
    setData: () => {},
    getValue: () => undefined,
    setValue: () => {},
  };
};

export const mockUseExtensions = () => {
  return {
    getAllSlots: () => [],
    getSlotComponents: () => [],
    getAllData: () => ({}),
    getNamespaceData: () => ({}),
    clearSlot: () => {},
    clearData: () => {},
  };
};

// Export all mocks together for convenience
export const mockGlobals = {
  notification: mockNotification,
  AssetsManager: mockAssetsManager,
  useExtensionSlot: mockUseExtensionSlot,
  useExtensionData: mockUseExtensionData,
  useExtensions: mockUseExtensions,
  // Add new objects here
};
