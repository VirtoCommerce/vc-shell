import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import type { AppDescriptor } from "@core/api/platform";
import type { AppBarWidget } from "@core/services/app-bar-menu-service";

vi.mock("@core/composables/usePermissions", () => ({
  usePermissions: () => ({
    hasAccess: (perm: string | string[] | undefined) => {
      if (!perm) return true;
      return perm !== "denied";
    },
  }),
}));

import { useAppHub } from "./useAppHub";

function makeApp(overrides: Partial<AppDescriptor> = {}): AppDescriptor {
  return {
    id: "app-1",
    title: "Test App",
    description: "A test application",
    relativeUrl: "/test",
    ...overrides,
  } as AppDescriptor;
}

function makeWidget(overrides: Partial<AppBarWidget> = {}): AppBarWidget {
  return {
    id: "widget-1",
    title: "My Widget",
    ...overrides,
  } as AppBarWidget;
}

describe("useAppHub", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result).toHaveProperty("searchQuery");
    expect(result).toHaveProperty("filteredApps");
    expect(result).toHaveProperty("filteredWidgets");
    expect(result).toHaveProperty("getWidgetTitle");
  });

  it("filteredApps returns all accessible apps when no query", () => {
    const apps = ref([makeApp(), makeApp({ id: "app-2", title: "Second" })]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: apps,
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result.filteredApps.value).toHaveLength(2);
  });

  it("filteredApps returns empty when showApplications is false", () => {
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([makeApp()]),
        widgets: ref([]),
        showApplications: ref(false),
        mobile: ref(false),
      }),
    );

    expect(result.filteredApps.value).toHaveLength(0);
  });

  it("filteredApps filters by permission", () => {
    const apps = ref([
      makeApp({ id: "ok", permission: undefined }),
      makeApp({ id: "denied-app", permission: "denied" }),
    ]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: apps,
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result.filteredApps.value).toHaveLength(1);
    expect(result.filteredApps.value[0].id).toBe("ok");
  });

  it("filters apps by search query", () => {
    const apps = ref([
      makeApp({ id: "a", title: "Catalog" }),
      makeApp({ id: "b", title: "Orders" }),
    ]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: apps,
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    result.searchQuery.value = "catalog";
    expect(result.filteredApps.value).toHaveLength(1);
    expect(result.filteredApps.value[0].id).toBe("a");
  });

  it("filters widgets by search query", () => {
    const widgets = ref([
      makeWidget({ id: "w1", title: "Notifications" }),
      makeWidget({ id: "w2", title: "Settings" }),
    ]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: widgets,
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    result.searchQuery.value = "notif";
    expect(result.filteredWidgets.value).toHaveLength(1);
    expect(result.filteredWidgets.value[0].id).toBe("w1");
  });

  it("getWidgetTitle returns title if present", () => {
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result.getWidgetTitle(makeWidget({ title: "My Title" }))).toBe("My Title");
  });

  it("getWidgetTitle humanizes id when no title", () => {
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: ref([]),
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result.getWidgetTitle(makeWidget({ id: "my-cool_widget", title: "" }))).toBe("My Cool Widget");
  });

  it("filteredWidgets returns all when no query", () => {
    const widgets = ref([makeWidget({ id: "w1" }), makeWidget({ id: "w2" })]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: widgets,
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    expect(result.filteredWidgets.value).toHaveLength(2);
  });

  it("filters widgets by searchTerms", () => {
    const widgets = ref([
      makeWidget({ id: "w1", title: "Alpha", searchTerms: ["beta", "gamma"] }),
    ]);
    const { result } = mountWithSetup(() =>
      useAppHub({
        appsList: ref([]),
        widgets: widgets,
        showApplications: ref(true),
        mobile: ref(false),
      }),
    );

    result.searchQuery.value = "gamma";
    expect(result.filteredWidgets.value).toHaveLength(1);
  });
});
