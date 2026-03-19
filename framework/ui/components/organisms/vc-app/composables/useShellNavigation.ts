import { useRoute, useRouter } from "vue-router";
import { useBlade } from "@core/composables/useBlade";
import { navigateToMainRoute } from "@core/blade-navigation/utils/navigateToMainRoute";
import { createLogger } from "@core/utilities";
import type { MenuItem } from "@core/types";

const logger = createLogger("useShellNavigation");

/**
 * Encapsulates menu click handling and blade navigation logic.
 * Extracted from vc-app.vue for separation of concerns.
 */
export function useShellNavigation() {
  const router = useRouter();
  const route = useRoute();
  const { openBlade } = useBlade();
  const routes = router.getRoutes();

  const handleMenuItemClick = (item: MenuItem) => {
    logger.debug("handleMenuItemClick() called");

    if (item.routeId) {
      openBlade({ name: item.routeId, isWorkspace: true });
    } else if (!item.routeId && item.url) {
      const itemUrl = item.url;
      // Match by exact path OR by comparing static (non-param) segments against item.url
      // Handles tenant-prefixed routes like "/:sellerId/products" matching item.url "/products"
      const menuRoute = routes.find((r) => {
        if (r.path === itemUrl) return true;
        const staticSegments = r.path
          .split("/")
          .filter(Boolean)
          .filter((s) => !s.startsWith(":"));
        const itemSegment = itemUrl.replace(/^\//, "");
        return staticSegments.includes(itemSegment);
      });
      if (typeof menuRoute === "undefined") {
        openRoot();
      } else {
        router.push({ name: menuRoute?.name, params: route.params });
      }
    }
  };

  const openRoot = async () => {
    // Navigate to main route — workspace cleanup is handled by BladeStack
    navigateToMainRoute(router, route.params as Record<string, string>);
  };

  return { handleMenuItemClick, openRoot };
}
