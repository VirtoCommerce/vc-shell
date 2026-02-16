import { ref, watch, onUnmounted } from "vue";
import { useNotifications } from "../../../../../core/composables";
import { useUserManagement } from "../../../../../core/composables/useUserManagement";
import { useAppSwitcher } from "../../../../../shared/components/app-switcher/composables/useAppSwitcher";

/**
 * Manages app readiness and authentication lifecycle.
 * Extracted from vc-app.vue for separation of concerns.
 */
export function useShellLifecycle(props: { isReady: boolean }) {
  const isAppReady = ref(false);
  const isBootstrapped = ref(false);
  const { isAuthenticated } = useUserManagement();
  const { loadFromHistory } = useNotifications();
  const { appsList, switchApp, getApps } = useAppSwitcher();

  // Show the shell as soon as isReady is true (don't block on auth).
  // Auth only gates one-time bootstrap (loading notifications, app list).
  watch(
    [() => props.isReady, isAuthenticated],
    async ([isReady, isAuth]) => {
      isAppReady.value = isReady;

      if (!isBootstrapped.value && isReady && isAuth) {
        isBootstrapped.value = true;
        await loadFromHistory();
        await getApps();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    isAppReady.value = false;
    isBootstrapped.value = false;
  });

  return { isAppReady, isAuthenticated, appsList, switchApp };
}
