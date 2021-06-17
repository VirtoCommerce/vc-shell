import { ref, computed } from "@vue/composition-api";

/** All registered blades */
const blades = ref([]);

/** All pinnned blades */
const drawer = ref([]);

/** All opened blades */
export const opened = ref([]);

/**
 * Put Blade options into registry.
 */
export function registerBlade(options) {
  blades.value.push(options);
  console.log("Registered blades: ", blades.value);
}

/**
 * Return readonly list of all registered blades.
 */
export function listBlades() {
  return computed(() => blades.value);
}

/**
 * Return readonly list of all opened blades.
 */
export function openedBlades() {
  return computed(() => opened.value);
}

/**
 * Open blade.
 */
export function openBlade(component, componentOptions) {
  opened.value.push({ id: Math.random(), component, componentOptions });
  console.log("Opened blades: ", opened.value);
}

/**
 * Close blade by id and all its descendants.
 */
export function closeBlade(id) {
  const bladeIndex = opened.value.findIndex((item) => item.id === id);
  if (bladeIndex > -1) {
    opened.value.splice(bladeIndex);
  }
}

/**
 * Close all blades.
 */
export function closeBlades() {
  opened.value.splice(0);
}

/**
 * Save drawer items into local storage.
 */
export function saveDrawer() {
  localStorage.setItem("vc-platform-drawer", JSON.stringify(drawer.value));
}

/**
 * Load drawer items from local storage.
 */
export function loadDrawer() {
  const savedData = localStorage.getItem("vc-platform-drawer");
  try {
    return JSON.parse(savedData || "[]");
  } catch (err) {
    return [];
  }
}

/**
 * Add item into drawer.
 */
export function addDrawerItem(item) {
  drawer.value.add(item);
}

/**
 * Remove item from drawer.
 */
export function removeDrawerItem(item) {
  drawer.value.delete(item);
}

/**
 * Return readonly list of all drawer items.
 */
export function getDrawer() {
  return computed(() => drawer.value);
}
