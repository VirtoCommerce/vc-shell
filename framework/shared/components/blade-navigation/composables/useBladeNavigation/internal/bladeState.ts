import { computed, shallowRef, Ref, toValue } from "vue";
import type { Router } from "vue-router";
import { DisplayableError, parseError } from "../../../../../../core/utilities/error";
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
        // Clear error of the parent blade if it was displaying an error related to the closing child
        if (prevBlade?.props?.navigation?.error?.value && startIndex > 0) {
          const childBladeName = blades.value[startIndex]?.type?.name;
          if (childBladeName && prevBlade.props.navigation.error.value.message.includes(childBladeName)) {
            prevBlade.props.navigation.error.value = null;
          }
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
    if (bladeNode.props.navigation) {
      bladeNode.props.navigation.error = shallowRef(null);
    }
    blades.value.push(bladeNode);
    blades.value = [...blades.value];
  }

  function replaceAllBlades(newBlades: BladeVNode[]): void {
    newBlades.forEach((b) => {
      if (b.props.navigation) {
        b.props.navigation.error = shallowRef(null);
      }
    });
    blades.value = newBlades;
  }

  function setActiveWorkspaceBlade(workspaceBlade?: BladeVNode): void {
    if (workspaceBlade && workspaceBlade.props?.navigation) {
      workspaceBlade.props.navigation.idx = 0;
      workspaceBlade.props.navigation.error = shallowRef(null);
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

  function setBladeError(bladeIdx: number, error: unknown): void {
    if (blades.value[bladeIdx] && blades.value[bladeIdx].props.navigation) {
      const parsed = parseError(error);
      (blades.value[bladeIdx].props.navigation as { error: Ref<DisplayableError | null> }).error = shallowRef(parsed);
      blades.value = [...blades.value]; // Trigger reactivity
    }
  }

  function clearBladeError(bladeIdx: number): void {
    if (blades.value[bladeIdx] && blades.value[bladeIdx].props.navigation) {
      blades.value[bladeIdx].props.navigation.error = shallowRef(null);
      blades.value = [...blades.value]; // Trigger reactivity
    }
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
    setBladeError,
    clearBladeError,
  };
}
