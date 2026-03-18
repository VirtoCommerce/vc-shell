import { computed, ref, type Ref } from "vue";
import { createLogger } from "@core/utilities";

const logger = createLogger("slow-network");
const SLOW_REQUEST_THRESHOLD_MS = 5000;
const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g"];
let _connectionHandler: (() => void) | null = null;

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

    const connection = (navigator as any).connection;
    if (connection) {
      _connectionHandler = () => {
        const isSlow = SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType);
        if (isSlow !== _isSlowEffectiveType.value) {
          logger.info(`Connection type: ${connection.effectiveType} → ${isSlow ? "slow" : "normal"}`);
        }
        _isSlowEffectiveType.value = isSlow;
      };
      connection.addEventListener("change", _connectionHandler);
      _connectionHandler(); // initial check
    }
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
      const connection = (navigator as any).connection;
      if (connection && _connectionHandler) {
        connection.removeEventListener("change", _connectionHandler);
        _connectionHandler = null;
      }
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
