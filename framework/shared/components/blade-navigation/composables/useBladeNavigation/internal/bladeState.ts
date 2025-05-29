import { computed, shallowRef, Ref, toValue } from "vue";
import type { Router } from "vue-router";
import type { BladeVNode } from "../../../types";

// --- Blade State Management Module ---
export function _createBladeStateManagement(router: Router) {
  const blades: Ref<BladeVNode[]> = shallowRef<BladeVNode[]>([]);
  const activeWorkspace: Ref<BladeVNode | undefined> = shallowRef<BladeVNode | undefined>();

  async function removeBladesStartingFrom(startIndex: number): Promise<boolean> {
    if (blades.value.length === 0 || startIndex < 0) {
      return false;
    }

    try {
      const bladesToClose = blades.value.slice(startIndex).reverse();
      let isPrevented = false;

      for (const blade of bladesToClose) {
        if (blade.props?.navigation?.onBeforeClose) {
          const result = await blade.props.navigation.onBeforeClose();
          if (result === false) {
            isPrevented = true;
            break; // Stop further checks if one blade prevents closing
          }
        }
      }

      if (!isPrevented) {
        const prevBlade = blades.value[startIndex - 1];

        if (startIndex > 0 && prevBlade?.props?.navigation?.isVisible === false) {
          prevBlade.props.navigation.isVisible = true;
        }

        // Clear param of table blade when closing child blade to prevent table row selection from being preserved
        if (
          prevBlade &&
          prevBlade.props?.navigation?.idx === 0 && // Is a workspace or first blade
          toValue(prevBlade.props?.param) === toValue(blades.value[startIndex]?.props?.param)
        ) {
          prevBlade.props.param = undefined;
        }

        blades.value.splice(startIndex);
        blades.value = [...blades.value]; // Trigger reactivity for watchers
      }
      return isPrevented;
    } finally {
      // Cleanup completed
    }
  }

  function addBlade(bladeNode: BladeVNode): void {
    blades.value.push(bladeNode);
    blades.value = [...blades.value];
  }

  function replaceAllBlades(newBlades: BladeVNode[]): void {
    blades.value = newBlades;
  }

  function setActiveWorkspaceBlade(workspaceBlade?: BladeVNode): void {
    if (workspaceBlade && workspaceBlade.props?.navigation) {
      workspaceBlade.props.navigation.idx = 0;
    }
    activeWorkspace.value = workspaceBlade;
    if (workspaceBlade) {
      blades.value = [workspaceBlade];
      // Ensure subsequent blades are closed if workspace changes directly
      removeBladesStartingFrom(1);
    } else {
      blades.value = [];
    }
  }

  function clearActiveWorkspaceState(): void {
    activeWorkspace.value = undefined;
    blades.value = [];
  }

  return {
    blades: computed(() => blades.value), // Expose as computed for readonly reactive access outside
    _bladesRef: blades, // Internal ref for mutation
    activeWorkspace: computed(() => activeWorkspace.value),
    _activeWorkspaceRef: activeWorkspace,
    removeBladesStartingFrom,
    addBlade,
    replaceAllBlades,
    setActiveWorkspaceBlade,
    clearActiveWorkspaceState,
  };
}
