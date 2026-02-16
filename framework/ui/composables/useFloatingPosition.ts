import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
  type Middleware,
  type Placement,
  type Strategy,
} from "@floating-ui/vue";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface FloatingOffset {
  mainAxis?: number;
  crossAxis?: number;
  alignmentAxis?: number;
}

export interface UseFloatingPositionOptions {
  placement?: MaybeRefOrGetter<Placement>;
  strategy?: MaybeRefOrGetter<Strategy>;
  offset?: MaybeRefOrGetter<FloatingOffset | number | undefined>;
  middleware?: MaybeRefOrGetter<Middleware[] | undefined>;
  enableFlip?: MaybeRefOrGetter<boolean>;
  enableShift?: MaybeRefOrGetter<boolean>;
  autoUpdate?: MaybeRefOrGetter<boolean>;
  shiftPadding?: number;
}

/**
 * Shared floating-ui adapter with reactive placement/offset defaults.
 */
export function useFloatingPosition(
  referenceEl: Ref<HTMLElement | null>,
  floatingEl: Ref<HTMLElement | null>,
  options: UseFloatingPositionOptions = {},
) {
  const resolvedPlacement = computed<Placement>(() => toValue(options.placement) ?? "bottom");
  const resolvedStrategy = computed<Strategy>(() => toValue(options.strategy) ?? "absolute");

  const resolvedMiddleware = computed<Middleware[]>(() => {
    const explicitMiddleware = toValue(options.middleware);

    if (explicitMiddleware?.length) {
      return explicitMiddleware;
    }

    const middleware: Middleware[] = [];

    if (toValue(options.enableFlip) !== false) {
      middleware.push(flip({ padding: options.shiftPadding ?? 8 }));
    }

    if (toValue(options.enableShift) !== false) {
      middleware.push(shift({ padding: options.shiftPadding ?? 8 }));
    }

    const offsetValue = toValue(options.offset);

    if (typeof offsetValue === "number") {
      middleware.push(floatingOffset(offsetValue));
    } else {
      middleware.push(
        floatingOffset({
          mainAxis: offsetValue?.mainAxis ?? 0,
          crossAxis: offsetValue?.crossAxis ?? 0,
          alignmentAxis: offsetValue?.alignmentAxis,
        }),
      );
    }

    return middleware;
  });

  const floating = useFloating(referenceEl, floatingEl, {
    placement: resolvedPlacement,
    strategy: resolvedStrategy,
    whileElementsMounted: toValue(options.autoUpdate) === false ? undefined : autoUpdate,
    middleware: resolvedMiddleware,
  });

  const floatingStyle = computed(() => ({
    position: resolvedStrategy.value,
    top: `${floating.y.value ?? 0}px`,
    left: `${floating.x.value ?? 0}px`,
  }));

  return {
    ...floating,
    floatingStyle,
    resolvedPlacement,
    resolvedStrategy,
  };
}
