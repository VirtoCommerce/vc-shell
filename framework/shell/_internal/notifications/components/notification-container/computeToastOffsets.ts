/**
 * Pure layout math for the toast stack. No Vue imports — deterministic given
 * the toast ids, their measured heights, and the expanded flag. Extracted from
 * NotificationContainer so the geometry can be unit-tested in isolation and the
 * component is left with only wiring + render.
 */

export const GAP = 14;
export const VISIBLE_TOASTS = 3;

export interface ToastLayout {
  /** Number of toasts stacked in front of this one (0 = front/newest). */
  sonnerIndex: number;
  /** CSS `--z-index`: front toast is highest. */
  zIndex: number;
  /** Vertical offset in px (sum of newer toast heights + gap * sonnerIndex). */
  offset: number;
  /** This toast's measured height in px (0 when not yet reported). */
  initialHeight: number;
}

export interface ToastStackLayout {
  /** Per-toast layout, in the same order as the input `ids`. */
  toasts: ToastLayout[];
  /** Height of the front (newest) toast in px. */
  frontHeight: number;
  /** Total height of the group element in px. */
  groupHeight: number;
}

/**
 * @param ids       toast ids, oldest → newest (array order matches the source list)
 * @param heights   map of toast id → measured height in px
 * @param isExpanded whether the stack is expanded (hover / single toast)
 */
export function computeToastOffsets(
  ids: (string | number | undefined)[],
  heights: Map<string | number, number>,
  isExpanded: boolean,
): ToastStackLayout {
  const count = ids.length;

  const heightOf = (id: string | number | undefined): number => (id !== undefined ? heights.get(id) || 0 : 0);

  // Front toast = newest = last in array
  const frontToastId = count > 0 ? ids[count - 1] : undefined;
  const frontHeight = heightOf(frontToastId);

  const toasts: ToastLayout[] = ids.map((id, arrayIndex) => {
    // sonnerIndex: 0 = front/newest, higher = older/back
    const sonnerIndex = count - 1 - arrayIndex;

    // Expanded offset: sum heights of newer toasts + gap * sonnerIndex
    let heightSum = 0;
    for (let i = arrayIndex + 1; i < count; i++) {
      heightSum += heightOf(ids[i]);
    }
    const offset = sonnerIndex * GAP + heightSum;

    return {
      sonnerIndex,
      zIndex: count - sonnerIndex,
      offset,
      initialHeight: heightOf(id),
    };
  });

  let groupHeight: number;
  if (isExpanded && count > 1) {
    // Expanded: offset of oldest toast + its height
    const oldestSonnerIdx = count - 1;
    let hSum = 0;
    for (let i = 1; i < count; i++) {
      hSum += heightOf(ids[i]);
    }
    const oldestOffset = oldestSonnerIdx * GAP + hSum;
    const oldestHeight = heightOf(ids[0]);
    groupHeight = oldestOffset + oldestHeight;
  } else {
    // Collapsed: front toast height + visible back toasts gap
    groupHeight = frontHeight + Math.min(count - 1, VISIBLE_TOASTS - 1) * GAP;
  }

  return { toasts, frontHeight, groupHeight };
}
