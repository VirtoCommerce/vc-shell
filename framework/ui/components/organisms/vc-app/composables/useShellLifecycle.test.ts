import { ref, nextTick } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { createMockUserManagement } from "@framework/test-mock-factories";

const mockIsAuthenticated = ref(false);
const mockLoadHistory = vi.fn().mockResolvedValue(undefined);
const mockGetApps = vi.fn().mockResolvedValue(undefined);
const mockAppsList = ref([]);
const mockSwitchApp = vi.fn();

const mockUserManagement = createMockUserManagement({ isAuthenticated: mockIsAuthenticated });
vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserManagement,
}));

vi.mock("@core/notifications", () => ({
  useNotificationStore: () => ({
    loadHistory: mockLoadHistory,
  }),
}));

vi.mock("@shell/components/app-hub/composables/useAppHub", () => ({
  useAppHub: () => ({
    appsList: mockAppsList,
    switchApp: mockSwitchApp,
    getApps: mockGetApps,
  }),
}));

import { useShellLifecycle } from "./useShellLifecycle";

describe("useShellLifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.value = false;
    mockAppsList.value = [];
  });

  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useShellLifecycle({ isReady: false }));

    expect(result).toHaveProperty("isAppReady");
    expect(result).toHaveProperty("isAuthenticated");
    expect(result).toHaveProperty("appsList");
    expect(result).toHaveProperty("switchApp");
  });

  it("isAppReady tracks isReady prop", async () => {
    const props = { isReady: false };
    const { result } = mountWithSetup(() => useShellLifecycle(props));

    expect(result.isAppReady.value).toBe(false);
  });

  it("isAppReady becomes true when isReady is true", () => {
    const { result } = mountWithSetup(() => useShellLifecycle({ isReady: true }));

    expect(result.isAppReady.value).toBe(true);
  });

  it("does not bootstrap when not authenticated", () => {
    mockIsAuthenticated.value = false;
    mountWithSetup(() => useShellLifecycle({ isReady: true }));

    expect(mockLoadHistory).not.toHaveBeenCalled();
    expect(mockGetApps).not.toHaveBeenCalled();
  });

  it("bootstraps when ready and authenticated", async () => {
    mockIsAuthenticated.value = true;
    mountWithSetup(() => useShellLifecycle({ isReady: true }));

    // watcher fires immediately with immediate: true
    await nextTick();
    expect(mockLoadHistory).toHaveBeenCalled();
    expect(mockGetApps).toHaveBeenCalled();
  });

  it("only bootstraps once per instance", async () => {
    vi.clearAllMocks();
    mockIsAuthenticated.value = true;
    const { wrapper } = mountWithSetup(() => useShellLifecycle({ isReady: true }));

    await nextTick();
    const callCount = mockLoadHistory.mock.calls.length;

    // Trigger watcher again
    mockIsAuthenticated.value = false;
    await nextTick();
    mockIsAuthenticated.value = true;
    await nextTick();

    // Should not have increased
    expect(mockLoadHistory).toHaveBeenCalledTimes(callCount);
    wrapper.unmount();
  });

  it("resets state on unmount", () => {
    const { result, wrapper } = mountWithSetup(() => useShellLifecycle({ isReady: true }));

    expect(result.isAppReady.value).toBe(true);
    wrapper.unmount();
    expect(result.isAppReady.value).toBe(false);
  });
});
