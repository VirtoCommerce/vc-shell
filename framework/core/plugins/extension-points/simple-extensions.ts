import { ref, reactive, computed, type Component } from 'vue';

// Base types for the extension system
export interface ExtensionComponent {
  id: string;
  component: Component;
  props?: Record<string, unknown>;
  priority?: number;
}

// Global state for all extensions
const extensionSlots = reactive<Record<string, ExtensionComponent[]>>({});
const extensionData = reactive<Record<string, any>>({});

// Composable for working with extension slots
export function useExtensionSlot(slotName: string) {
  // Initialize slot if it doesn't exist
  if (!extensionSlots[slotName]) {
    extensionSlots[slotName] = [];
  }

  // Reactive list of components in slot, sorted by priority
  const components = computed(() => {
    return extensionSlots[slotName]?.slice().sort((a, b) => (a.priority || 0) - (b.priority || 0)) || [];
  });

  // Add component to slot
  const addComponent = (component: ExtensionComponent) => {
    const existingIndex = extensionSlots[slotName].findIndex(c => c.id === component.id);

    if (existingIndex !== -1) {
      // Replace existing component
      extensionSlots[slotName][existingIndex] = component;
    } else {
      // Add new component
      extensionSlots[slotName].push(component);
    }
  };

  // Remove component from slot
  const removeComponent = (componentId: string) => {
    const index = extensionSlots[slotName].findIndex(c => c.id === componentId);
    if (index !== -1) {
      extensionSlots[slotName].splice(index, 1);
    }
  };

  // Check if slot has components
  const hasComponents = computed(() => components.value.length > 0);

  return {
    components,
    addComponent,
    removeComponent,
    hasComponents,
  };
}

// Composable for data exchange between modules
export function useExtensionData(namespace: string) {
  // Initialize namespace if it doesn't exist
  if (!extensionData[namespace]) {
    extensionData[namespace] = {};
  }

  // Reactive data
  const data = computed(() => extensionData[namespace] || {});

  // Update data (merge)
  const updateData = (newData: Record<string, any>) => {
    extensionData[namespace] = {
      ...extensionData[namespace],
      ...newData,
    };
  };

  // Set data (replace)
  const setData = (newData: Record<string, any>) => {
    extensionData[namespace] = newData;
  };

  // Get specific value
  const getValue = (key: string, defaultValue?: any) => {
    return extensionData[namespace]?.[key] ?? defaultValue;
  };

  // Set specific value
  const setValue = (key: string, value: any) => {
    if (!extensionData[namespace]) {
      extensionData[namespace] = {};
    }
    extensionData[namespace][key] = value;
  };

  return {
    data,
    updateData,
    setData,
    getValue,
    setValue,
  };
}

// Composable for global extension management
export function useExtensions() {
  // Get all slots
  const getAllSlots = () => {
    return Object.keys(extensionSlots);
  };

  // Get components from specific slot
  const getSlotComponents = (slotName: string) => {
    return extensionSlots[slotName] || [];
  };

  // Get all data
  const getAllData = () => {
    return extensionData;
  };

  // Get data from specific namespace
  const getNamespaceData = (namespace: string) => {
    return extensionData[namespace] || {};
  };

  // Clear slot
  const clearSlot = (slotName: string) => {
    if (extensionSlots[slotName]) {
      extensionSlots[slotName].length = 0;
    }
  };

  // Clear data namespace
  const clearData = (namespace: string) => {
    if (extensionData[namespace]) {
      delete extensionData[namespace];
    }
  };

  return {
    getAllSlots,
    getSlotComponents,
    getAllData,
    getNamespaceData,
    clearSlot,
    clearData,
  };
}