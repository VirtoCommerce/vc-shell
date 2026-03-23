import { ref, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

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
import { useAppInsights, AppInsightsInstanceKey } from "./index";

/** Helper: runs useAppInsights inside a component so provide/inject works. */
function runWithProvide(): ReturnType<typeof useAppInsights> {
  let result!: ReturnType<typeof useAppInsights>;
  const Wrapper = defineComponent({
    setup() {
      result = useAppInsights();
      return () => h("div");
    },
  });
  mount(Wrapper, {
    global: {
      provide: {
        [AppInsightsInstanceKey as symbol]: mockAppInsights,
      },
    },
  });
  return result;
}

describe("useAppInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppInsights.context.telemetryTrace.traceID = "";
    mockAppInsights.context.telemetryTrace.name = "";
  });

  it("returns setupPageTracking and appInsights", () => {
    const result = runWithProvide();
    expect(result.appInsights).toBeDefined();
    expect(result.setupPageTracking).toBeDefined();
    expect(result.setupPageTracking.beforeEach).toBeTypeOf("function");
    expect(result.setupPageTracking.afterEach).toBeTypeOf("function");
  });

  it("beforeEach sets traceID and starts tracking", () => {
    const { setupPageTracking } = runWithProvide();
    setupPageTracking.beforeEach({ name: "TestPage" });

    expect(mockAppInsights.context.telemetryTrace.traceID).toBe("mock-w3c-id");
    expect(mockAppInsights.context.telemetryTrace.name).toBe("TestPage");
    expect(mockStartTrackPage).toHaveBeenCalledWith("TestPage");
  });

  it("afterEach stops tracking with URL and user info", () => {
    const { setupPageTracking } = runWithProvide();
    setupPageTracking.afterEach({ name: "TestPage", fullPath: "/test/path" });

    expect(mockStopTrackPage).toHaveBeenCalledWith("TestPage", expect.stringContaining("/test/path"), {
      userId: "user-123",
      userName: "testuser",
    });
  });

  it("afterEach URL includes protocol and host", () => {
    const { setupPageTracking } = runWithProvide();
    setupPageTracking.afterEach({ name: "Page", fullPath: "/foo" });

    const url = mockStopTrackPage.mock.calls[0][1];
    expect(url).toMatch(/^https?:\/\/.+\/foo$/);
  });
});
