import { h, Component, isVNode } from "vue";
import { reactifyObject, reactiveComputed } from "@vueuse/core";
import * as _ from "lodash-es";
import { RouteLocationNormalized, Router, LocationQuery, NavigationFailure, RouteParams } from "vue-router";
import { useAppInsights } from "../../../../../../core/composables";
import { i18n } from "../../../../../../core/plugins/i18n";
import type { notification as NotificationServiceType } from "../../../../notifications";
import type { BladeVNode, IBladeEvent, BladeInstanceConstructor } from "../../../types";
import type { _createBladeStateManagement } from "./bladeState";
import type { _createRouterUtils } from "./routerUtils";
import { createLogger } from "../../../../../../core/utilities";

const logger = createLogger("blade-actions");

// --- Blade Actions Module ---
export function _createBladeActions(
  router: Router,
  route: RouteLocationNormalized,
  bladeState: ReturnType<typeof _createBladeStateManagement>,
  routerUtils: ReturnType<typeof _createRouterUtils>,
  ensureBladeComponent: <Blade extends Component>(
    bladeInput: BladeInstanceConstructor<Blade> | { name: string } | null | undefined,
  ) => BladeInstanceConstructor<Blade>,
  hasAccess: (permissions?: string | string[]) => boolean,
  notificationServiceInstance: typeof NotificationServiceType,
  i18nInstance: typeof i18n,
  setupPageTrackingInstance: ReturnType<typeof useAppInsights>["setupPageTracking"],
) {
  async function openWorkspace<Blade extends Component>(
    { blade: bladeInput, param, options }: IBladeEvent<Blade>,
    query: LocationQuery | undefined = undefined,
    routeParams: RouteParams = {},
    replace = false,
  ): Promise<NavigationFailure | void> {
    const bladeComponent = ensureBladeComponent(bladeInput);
    const componentProps = reactifyObject({
      param,
      options,
      navigation: { idx: 0 },
    });
    const createdComponent = h(bladeComponent, componentProps) as BladeVNode;

    try {
      const isPrevented = await bladeState.removeBladesStartingFrom(0);
      if (isPrevented) {
        return;
      }

      if (createdComponent.type?.url) {
        if (hasAccess(bladeComponent.permissions)) {
          if (bladeState.blades.value.length > 0 && bladeState.blades.value[0].type.url === createdComponent.type.url) {
            return;
          }
          bladeState.setActiveWorkspaceBlade(createdComponent);

          const targetRoute = routerUtils.allRoutes.find((r) => r.path.endsWith(createdComponent.type?.url as string));
          if (targetRoute && targetRoute.components) {
            (targetRoute.components as Record<string, Component | BladeVNode>).default = createdComponent;
          }

          return router.push({
            name: targetRoute?.name,
            params: { ...routeParams, ...route.params },
            query,
            replace,
          });
        } else {
          notificationServiceInstance.error(i18nInstance.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
            timeout: 3000,
          });
        }
      }
    } catch (e) {
      logger.error("Error opening workspace:", e);
      const bladeNameForError =
        bladeComponent?.type?.name ||
        (typeof bladeInput === "object" && "name" in bladeInput ? bladeInput.name : "Unknown");
      throw new Error(`Opening workspace '${bladeNameForError}' is prevented or failed.`);
    }
  }

  async function openBlade<Blade extends Component>(
    args: IBladeEvent<Blade>,
    isWorkspaceTarget = false,
    sourceBladeInstance?: BladeVNode,
  ): Promise<void | NavigationFailure> {
    const { blade: bladeInput, param, options, onOpen, onClose, replaceCurrentBlade = false } = args;
    const bladeComponent = ensureBladeComponent(bladeInput);

    if (isWorkspaceTarget) {
      return openWorkspace({ blade: bladeComponent, param, options });
    }

    try {
      const instanceComponent = sourceBladeInstance || bladeState.activeWorkspace.value;

      if (!instanceComponent) {
        logger.error("No active workspace or source blade instance provided to open a blade into.");
        throw new Error("No workspace or source blade context to open blade.");
      }
      if (!isVNode(instanceComponent)) {
        logger.error("Source blade instance or active workspace is not a valid VNode.", instanceComponent);
        throw new Error("Internal error: Invalid instanceComponent for opening blade.");
      }

      const instanceComponentIndex = _.findLastIndex(bladeState.blades.value, (x): x is BladeVNode => {
        if (!x) return false;
        return _.isEqual(x.type, instanceComponent.type);
      });

      const parentBladeIndex = instanceComponentIndex >= 0 ? instanceComponentIndex : -1;
      const childBladeIndex = parentBladeIndex + 1;

      let isPrevented = false;
      if (bladeState.blades.value[childBladeIndex]) {
        isPrevented = await bladeState.removeBladesStartingFrom(childBladeIndex);
      }

      const currentBladeIdx = parentBladeIndex;

      const bladeNode = h(
        bladeComponent,
        Object.assign(
          {},
          reactiveComputed(() => ({ options, param })),
          { navigation: { onOpen, onClose, idx: currentBladeIdx + 1, isVisible: true } },
        ),
      ) as BladeVNode;

      if (!isPrevented) {
        if (hasAccess(bladeComponent.permissions)) {
          if (replaceCurrentBlade && currentBladeIdx >= 0 && bladeState.blades.value[currentBladeIdx]) {
            if (bladeState.blades.value[currentBladeIdx]) {
              bladeState.blades.value[currentBladeIdx].props.navigation.isVisible = false;
            }
          }
          setupPageTrackingInstance.beforeEach({ name: bladeNode.type.name! });
          bladeState.addBlade(bladeNode);
        } else {
          notificationServiceInstance.error(i18nInstance.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
            timeout: 3000,
          });
        }
      }
    } catch (e) {
      logger.error("Error in openBlade:", e);
    }
  }

  return {
    openWorkspace,
    openBlade,
  };
}
