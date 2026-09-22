import { computed, ref, watch, type Ref } from "vue";
import { createLogger } from "@core/utilities";
import { useConnectionStatus } from "@core/composables/useConnectionStatus";

const logger = createLogger("slow-network");
const SLOW_REQUEST_THRESHOLD_MS = 10000;
const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g"];
let _connectionHandler: (() => void) | null = null;

/**
 * A slow network is a state, not an event, so it is published as a class on the document
 * rather than as a toast. A toast could only take one of two shapes here, and both were
 * wrong: a dismissable one reappeared on every action that outran the threshold, and a
 * sticky one sat on the screen for the whole session on a 2g connection (VCST-6045).
 * `useConnectionStatus` marks the offline state the same way, with `vc-offline`.
 */
const SLOW_NETWORK_CLASS = "vc-slow-network";
const DISMISS_DELAY_MS = 3000;
let _dismissTimer: ReturnType<typeof setTimeout> | null = null;

function markSlowNetwork() {
  document.documentElement.classList.add(SLOW_NETWORK_CLASS);
}

function clearSlowNetwork() {
  document.documentElement.classList.remove(SLOW_NETWORK_CLASS);
}

// ── Module-level singleton state ────────────────────────────────────
const _isSetup = ref(false);
const _slowRequestCount = ref(0);
const _isSlowEffectiveType = ref(false);
const _pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
const _trackedSlowIds = new Set<string>();

const isSlowNetwork = computed(() => _slowRequestCount.value > 0 || _isSlowEffectiveType.value);

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

    const { isOnline } = useConnectionStatus();

    watch(isSlowNetwork, (slow) => {
      if (slow) {
        if (_dismissTimer != null) {
          clearTimeout(_dismissTimer);
          _dismissTimer = null;
        }
        if (isOnline.value) {
          logger.info("Slow network detected");
          markSlowNetwork();
        }
      } else {
        _dismissTimer = setTimeout(() => {
          logger.info("Network recovered");
          clearSlowNetwork();
          _dismissTimer = null;
        }, DISMISS_DELAY_MS);
      }
    });

    watch(isOnline, (online) => {
      if (!online) {
        if (_dismissTimer != null) {
          clearTimeout(_dismissTimer);
          _dismissTimer = null;
        }
        clearSlowNetwork();
      } else if (isSlowNetwork.value) {
        markSlowNetwork();
      }
    });
  }

  return {
    isSlowNetwork,
    trackRequest,
    untrackRequest,
  };
}

/** Test-only: reset singleton state between tests. No-op in production builds. @internal — not public API. */
export const _resetForTest: (() => void) | undefined = import.meta.env.VITEST
  ? () => {
      const connection = (navigator as any).connection;
      if (connection && _connectionHandler) {
        connection.removeEventListener("change", _connectionHandler);
        _connectionHandler = null;
      }
      if (_dismissTimer != null) {
        clearTimeout(_dismissTimer);
        _dismissTimer = null;
      }
      clearSlowNetwork();
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
