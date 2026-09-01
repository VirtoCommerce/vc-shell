import { describe, it, expect } from "vitest";
import { effectScope } from "vue";
import { useLatestRequest } from "./index";

describe("useLatestRequest", () => {
  it("treats only the newest request as current", () => {
    const tracker = useLatestRequest();

    const first = tracker.begin();
    const second = tracker.begin();

    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);
  });

  // The race the primitive exists for: typing in a search field fires overlapping
  // requests and the slowest one used to win.
  it("lets the caller drop a slow response that a newer one superseded", async () => {
    const tracker = useLatestRequest();
    const applied: string[] = [];

    async function load(value: string, delayMs: number) {
      const request = tracker.begin();
      try {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        if (!request.isCurrent()) return;
        applied.push(value);
      } finally {
        request.complete();
      }
    }

    await Promise.all([load("slow", 20), load("fast", 0)]);

    expect(applied).toEqual(["fast"]);
  });

  it("is pending while the newest request is in flight", () => {
    const tracker = useLatestRequest();
    expect(tracker.pending.value).toBe(false);

    const request = tracker.begin();
    expect(tracker.pending.value).toBe(true);

    request.complete();
    expect(tracker.pending.value).toBe(false);
  });

  it("stays pending when a superseded request completes before the newest one", () => {
    const tracker = useLatestRequest();

    const stale = tracker.begin();
    tracker.begin();

    stale.complete();

    // The newer request is still running — clearing here would hide the spinner
    // while the screen is still waiting for data.
    expect(tracker.pending.value).toBe(true);
  });

  it("ignores a repeated complete", () => {
    const tracker = useLatestRequest();
    const request = tracker.begin();

    request.complete();
    request.complete();

    expect(tracker.pending.value).toBe(false);
  });

  it("invalidate supersedes the in-flight request and clears pending", () => {
    const tracker = useLatestRequest();
    const request = tracker.begin();

    tracker.invalidate();

    expect(request.isCurrent()).toBe(false);
    expect(tracker.pending.value).toBe(false);
  });

  it("keeps every request non-current after dispose", () => {
    const tracker = useLatestRequest();
    const before = tracker.begin();

    tracker.dispose();

    expect(before.isCurrent()).toBe(false);
    // A request begun after disposal must not come back to life either.
    expect(tracker.begin().isCurrent()).toBe(false);
  });

  // A response landing after its blade closed must not write into a dead scope.
  it("disposes itself when the owning scope is stopped", () => {
    const scope = effectScope();
    const tracker = scope.run(() => useLatestRequest())!;
    const request = tracker.begin();

    expect(request.isCurrent()).toBe(true);

    scope.stop();

    expect(request.isCurrent()).toBe(false);
  });
});

describe("useLatestRequest.latest", () => {
  /** A promise the test decides when to settle. */
  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  it("hands back the result of an unsuperseded request", async () => {
    const tracker = useLatestRequest();

    await expect(tracker.latest(Promise.resolve("data"))).resolves.toBe("data");
  });

  // The whole point: the slow earlier request must not deliver its answer.
  it("resolves a superseded request to undefined", async () => {
    const tracker = useLatestRequest();
    const earlier = deferred<string>();

    const first = tracker.latest(earlier.promise);
    const second = tracker.latest(Promise.resolve("fresh"));

    await expect(second).resolves.toBe("fresh");
    earlier.resolve("stale");
    await expect(first).resolves.toBeUndefined();
  });

  it("keeps pending true until the newest request settles", async () => {
    const tracker = useLatestRequest();
    const earlier = deferred<string>();
    const later = deferred<string>();

    const first = tracker.latest(earlier.promise);
    const second = tracker.latest(later.promise);
    expect(tracker.pending.value).toBe(true);

    // The superseded one finishing must not clear pending — the screen is still
    // waiting for the newer answer.
    earlier.resolve("stale");
    await first;
    expect(tracker.pending.value).toBe(true);

    later.resolve("fresh");
    await second;
    expect(tracker.pending.value).toBe(false);
  });

  it("propagates a rejection instead of swallowing it", async () => {
    const tracker = useLatestRequest();

    await expect(tracker.latest(Promise.reject(new Error("boom")))).rejects.toThrow("boom");
  });

  // A throw must not leave the tracker thinking a request is still running.
  it("clears pending when the request rejects", async () => {
    const tracker = useLatestRequest();

    await expect(tracker.latest(Promise.reject(new Error("boom")))).rejects.toThrow();

    expect(tracker.pending.value).toBe(false);
  });

  it("drops a request that invalidate superseded", async () => {
    const tracker = useLatestRequest();
    const inflight = deferred<string>();

    const result = tracker.latest(inflight.promise);
    tracker.invalidate();
    inflight.resolve("stale");

    await expect(result).resolves.toBeUndefined();
  });

  it("drops a request whose scope stopped while it was in flight", async () => {
    const scope = effectScope();
    let tracker!: ReturnType<typeof useLatestRequest>;
    scope.run(() => {
      tracker = useLatestRequest();
    });
    const inflight = deferred<string>();

    const result = tracker.latest(inflight.promise);
    scope.stop();
    inflight.resolve("stale");

    await expect(result).resolves.toBeUndefined();
  });
});
