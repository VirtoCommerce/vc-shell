import { computed, ref, type Ref } from "vue";

const SLOW_REQUEST_THRESHOLD_MS = 5000;

// ── Module-level singleton state ────────────────────────────────────
const _isSetup = ref(false);
const _slowRequestCount = ref(0);
const _isSlowEffectiveType = ref(false);
const _pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
const _trackedSlowIds = new Set<string>();

const isSlowNetwork = computed(
  () => _slowRequestCount.value > 0 || _isSlowEffectiveType.value,
);

export interface UseSlowNetworkDetectionReturn {
  isSlowNetwork: Readonly<Ref<boolean>>;
  trackRequest(id: string): void;
  untrackRequest(id: string): void;
}

function trackRequest(id: string): void {
  const timer = setTimeout(() => {
    _slowRequestCount.value++;
    _pendingTimers.delete(id);
    _trackedSlowIds.add(id);
  }, SLOW_REQUEST_THRESHOLD_MS);
  _pendingTimers.set(id, timer);
}

function untrackRequest(id: string): void {
  const timer = _pendingTimers.get(id);
  if (timer != null) {
    // Request completed before threshold — cancel timer
    clearTimeout(timer);
    _pendingTimers.delete(id);
  } else if (_trackedSlowIds.has(id)) {
    // Timer already fired — decrement slow count
    _slowRequestCount.value = Math.max(0, _slowRequestCount.value - 1);
    _trackedSlowIds.delete(id);
  }
  // else: unknown id — no-op (defensive)
}

export function useSlowNetworkDetection(): UseSlowNetworkDetectionReturn {
  if (!_isSetup.value && typeof window !== "undefined") {
    _isSetup.value = true;
    // effectiveType and notification setup added in later tasks
  }

  return {
    isSlowNetwork,
    trackRequest,
    untrackRequest,
  };
}

/** Test-only: reset singleton state between tests. No-op in production builds. */
export const _resetForTest: (() => void) | undefined = import.meta.env.VITEST
  ? () => {
      _isSetup.value = false;
      _slowRequestCount.value = 0;
      _isSlowEffectiveType.value = false;
      for (const timer of _pendingTimers.values()) {
        clearTimeout(timer);
      }
      _pendingTimers.clear();
      _trackedSlowIds.clear();
    }
  : undefined;
