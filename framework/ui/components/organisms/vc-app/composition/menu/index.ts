// Legacy app-bound menu components (use useMenuService internally)
export { default as VcAppMenu } from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";

export {
  useMenuActiveState,
  stripTenantPrefix,
} from "@ui/components/organisms/vc-app/_internal/menu/composables/useMenuActiveState";
export { useBadge } from "@ui/components/organisms/vc-app/_internal/menu/composables/useBadge";
