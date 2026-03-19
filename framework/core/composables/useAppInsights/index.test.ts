import { ref } from "vue";

// Mock external dependencies before importing the module under test
const mockStartTrackPage = vi.fn();
const mockStopTrackPage = vi.fn();
const mockAppInsights = {
  startTrackPage: mockStartTrackPage,
  stopTrackPage: mockStopTrackPage,
  context: {
    telemetryTrace: {
      traceID: "",
      name: "",
    },
  },
};

vi.mock("vue3-application-insights", () => ({
  useAppInsights: () => mockAppInsights,
  AppInsightsPluginOptions: {},
}));

vi.mock("@microsoft/applicationinsights-core-js", () => ({
  generateW3CId: () => "mock-w3c-id",
}));

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    user: ref({ id: "user-123", userName: "testuser" }),
  }),
}));

// Must import after mocks are set up
import { useAppInsights } from "./index";

describe("useAppInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppInsights.context.telemetryTrace.traceID = "";
    mockAppInsights.context.telemetryTrace.name = "";
  });

  it("returns setupPageTracking and appInsights", () => {
    const result = useAppInsights();
    expect(result.appInsights).toBeDefined();
    expect(result.setupPageTracking).toBeDefined();
    expect(result.setupPageTracking.beforeEach).toBeTypeOf("function");
    expect(result.setupPageTracking.afterEach).toBeTypeOf("function");
  });

  it("beforeEach sets traceID and starts tracking", () => {
    const { setupPageTracking } = useAppInsights();
    setupPageTracking.beforeEach({ name: "TestPage" });

    expect(mockAppInsights.context.telemetryTrace.traceID).toBe("mock-w3c-id");
    expect(mockAppInsights.context.telemetryTrace.name).toBe("TestPage");
    expect(mockStartTrackPage).toHaveBeenCalledWith("TestPage");
  });

  it("afterEach stops tracking with URL and user info", () => {
    const { setupPageTracking } = useAppInsights();
    setupPageTracking.afterEach({ name: "TestPage", fullPath: "/test/path" });

    expect(mockStopTrackPage).toHaveBeenCalledWith(
      "TestPage",
      expect.stringContaining("/test/path"),
      { userId: "user-123", userName: "testuser" },
    );
  });

  it("afterEach URL includes protocol and host", () => {
    const { setupPageTracking } = useAppInsights();
    setupPageTracking.afterEach({ name: "Page", fullPath: "/foo" });

    const url = mockStopTrackPage.mock.calls[0][1];
    expect(url).toMatch(/^https?:\/\/.+\/foo$/);
  });
});
