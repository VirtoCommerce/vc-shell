/* eslint-disable import/prefer-default-export */
export { default as VcBlade } from "./vc-blade.vue";
export { default as VcBreadcrumbs } from "./vc-breadcrumbs.vue";
export { default as VcButton } from "./vc-button.vue";
export { default as VcCheckbox } from "./vc-checkbox.vue";
export { default as VcContainer } from "./vc-container.vue";
export { default as VcDrawerItem } from "./vc-drawer-item.vue";
export { default as VcDrawerToggler } from "./vc-drawer-toggler.vue";
export { default as VcDrawer } from "./vc-drawer.vue";
export { default as VcIcon } from "./vc-icon.vue";
export { default as VcInput } from "./vc-input.vue";
export { default as VcLayout } from "./vc-layout.vue";
export { default as VcLink } from "./vc-link.vue";
export { default as VcSpacer } from "./vc-spacer.vue";
export { default as VcTable } from "./vc-table.vue";

export {
    openBlade,
    registerBlade,
    openedBlades,
    addDrawerItem,
    closeBlade,
    getDrawer,
    listBlades,
    loadDrawer,
    removeDrawerItem,
    saveDrawer
} from './router';