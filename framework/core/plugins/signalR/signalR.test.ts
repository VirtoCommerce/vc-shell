import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { ref } from "vue";

const authenticated = ref(true);

/**
 * What `connection.start()` does, swapped per test.
 *
 * Each `install()` builds its own connection with its own mocks, and installs
 * from earlier tests stay subscribed to the shared auth ref. Counting calls on a
 * single shared mock therefore counts other tests' retries too — hence one mock
 * per connection, and assertions against the newest one.
 */
let startImpl: () => Promise<void> = async () => {};
const connections: Array<{ start: Mock; stop: Mock }> = [];

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({ isAuthenticated: authenticated }),
}));

vi.mock("@core/notifications", () => ({
  useNotificationStore: () => ({ ingest: vi.fn() }),
}));

// Returns a mock connection under vitest by default, which would bypass the
// builder — and with it the retry logic under test.
vi.mock("cypress-signalr-mock", () => ({
  useCypressSignalRMock: () => null,
}));

vi.mock("@microsoft/signalr", () => {
  class HubConnectionBuilder {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    configureLogging() {
      return this;
    }
    build() {
      const connection = {
        start: vi.fn(() => startImpl()),
        stop: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        onclose: vi.fn(),
      };
      connections.push(connection);
      return connection;
    }
  }
  return { HubConnectionBuilder, LogLevel: { Information: 1 } };
});

import { signalR } from "./index";

/** Lets the `.then`/`.catch` chain on the mocked `start()` settle. */
function flushMicrotasks() {
  return Promise.resolve().then().then();
}

/** Installs the plugin and returns the connection it just built. */
async function install() {
  signalR.install({} as never);
  await flushMicrotasks();
  return connections[connections.length - 1];
}

function failWith(message: string) {
  startImpl = () => Promise.reject(new Error(message));
}

beforeEach(() => {
  vi.useFakeTimers();
  authenticated.value = true;
});

afterEach(async () => {
  // Stops this install's retry chain so it cannot keep scheduling timers.
  authenticated.value = false;
  await flushMicrotasks();
  vi.useRealTimers();
});

describe("signalR reconnect", () => {
  // The bug this covers: an expired cookie made negotiate answer 401, and the
  // unconditional 5s retry then repeated it forever. Without a fresh sign-in the
  // answer cannot change, so retrying only fills the console.
  it("stops retrying once negotiate answers 401", async () => {
    failWith("Failed to complete negotiation with the server: Status code '401'");

    const { start } = await install();
    expect(start).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(60_000);

    expect(start).toHaveBeenCalledTimes(1);
  });

  it("retries an ordinary connection failure", async () => {
    failWith("Failed to complete negotiation with the server: Status code '503'");

    const { start } = await install();
    expect(start).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5_000);
    expect(start).toHaveBeenCalledTimes(2);
  });

  it("backs off instead of retrying at a fixed interval", async () => {
    failWith("network down");

    const { start } = await install();

    // 5s, then 10s, then 20s — a fixed 5s cadence would have reached 5 calls.
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.advanceTimersByTimeAsync(20_000);

    expect(start).toHaveBeenCalledTimes(4);
  });

  it("caps the backoff", async () => {
    failWith("network down");

    const { start } = await install();
    // Walk past the point where doubling would exceed the cap.
    for (const delay of [5_000, 10_000, 20_000, 40_000, 60_000]) {
      await vi.advanceTimersByTimeAsync(delay);
    }
    const beforeCap = start.mock.calls.length;

    await vi.advanceTimersByTimeAsync(60_000);

    expect(start).toHaveBeenCalledTimes(beforeCap + 1);
  });

  it("does not reconnect after sign-out cancels a pending retry", async () => {
    failWith("network down");

    const { start, stop } = await install();
    const afterInstall = start.mock.calls.length;

    authenticated.value = false;
    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(stop).toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(afterInstall);
  });

  it("starts a fresh sign-in from the base delay", async () => {
    failWith("network down");

    const { start } = await install();
    // Build up some backoff, then sign out and back in.
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(10_000);

    authenticated.value = false;
    await flushMicrotasks();
    authenticated.value = true;
    await flushMicrotasks();

    const afterSignIn = start.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5_000);

    expect(start).toHaveBeenCalledTimes(afterSignIn + 1);
  });
});
