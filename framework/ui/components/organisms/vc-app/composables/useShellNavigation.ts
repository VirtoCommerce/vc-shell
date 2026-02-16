import { useRoute, useRouter } from "vue-router";
import { useBladeNavigation } from "../../../../../shared/components";
import { createLogger } from "../../../../../core/utilities";
import type { MenuItem } from "../../../../../core/types";

const logger = createLogger("useShellNavigation");

/**
 * Encapsulates menu click handling and blade navigation logic.
 * Extracted from vc-app.vue for separation of concerns.
 */
export function useShellNavigation() {
  const router = useRouter();
  const route = useRoute();
  const { openBlade, closeBlade, resolveBladeByName, goToRoot } = useBladeNavigation();
  const routes = router.getRoutes();

  const handleMenuItemClick = (item: MenuItem) => {
    logger.debug("handleMenuItemClick() called");

    if (item.routeId) {
      const bladeComponent = resolveBladeByName(item.routeId);
      if (bladeComponent) {
        openBlade({ blade: bladeComponent }, true);
      } else {
        logger.error(`Blade component with routeId '${item.routeId}' not found.`);
      }
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
    const isPrevented = await closeBlade(1);
    if (!isPrevented) {
      router.push(goToRoot());
    }
  };

  return { handleMenuItemClick, openRoot };
}
