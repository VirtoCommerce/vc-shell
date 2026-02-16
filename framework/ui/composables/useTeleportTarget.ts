import { computed, inject, type MaybeRefOrGetter, toValue } from "vue";
import { AppRootElementKey } from "../../injection-keys";

export interface UseTeleportTargetOptions {
  to?: MaybeRefOrGetter<string | HTMLElement | null | undefined>;
  fallbackToBody?: boolean;
}

/**
 * Resolves teleport target consistently across the UI kit.
 * Priority: explicit target -> vc-app root element -> body.
 */
export function useTeleportTarget(options: UseTeleportTargetOptions = {}) {
  const appRootRef = inject(AppRootElementKey, undefined);

  const teleportTarget = computed<string | HTMLElement | undefined>(() => {
    const explicitTarget = options.to ? toValue(options.to) : undefined;

    if (explicitTarget) {
      return explicitTarget;
    }

    if (appRootRef?.value) {
      return appRootRef.value;
    }

    if (options.fallbackToBody === false) {
      return undefined;
    }

    return "body";
  });

  return {
    teleportTarget,
  };
}
