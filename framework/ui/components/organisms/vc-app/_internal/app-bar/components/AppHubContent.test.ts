import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, markRaw, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import type { AppDescriptor } from "@core/api/platform";
import { createAppBarWidgetService, type registerAppBarWidgetOptions } from "@core/services/app-bar-menu-service";
import { AppBarWidgetServiceKey } from "@framework/injection-keys";
import { provideAppBarState } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState";
import AppHubContent from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppHubContent.vue";

const TestHarness = defineComponent({
  name: "TestHarness",
  components: { AppHubContent },
  props: {
    appsList: {
      type: Array as () => AppDescriptor[],
      default: () => [],
    },
    showApplications: {
      type: Boolean,
      default: true,
    },
    mobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["switch-app"],
  setup() {
    provideAppBarState();
    return {};
  },
  template: `
    <AppHubContent
      :apps-list="appsList"
      :show-applications="showApplications"
      :mobile="mobile"
      @switch-app="$emit('switch-app', $event)"
    />
  `,
});

function mountHub(options?: { apps?: AppDescriptor[]; widgets?: registerAppBarWidgetOptions[] }) {
  const service = createAppBarWidgetService();

  (options?.widgets ?? []).forEach((widget) => {
    service.register(widget);
  });

  return mount(TestHarness, {
    attachTo: document.body,
    props: {
      appsList: options?.apps ?? [],
      showApplications: true,
      mobile: false,
    },
    global: {
      provide: {
        [AppBarWidgetServiceKey as symbol]: service,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
}

describe("AppHubContent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("filters applications and widgets by search query", async () => {
    const wrapper = mountHub({
      apps: [
        { id: "commerce", title: "Commerce Manager", description: "Main app" },
        { id: "reports", title: "Reports", description: "Analytics" },
      ] as AppDescriptor[],
      widgets: [
        { id: "notification-dropdown", title: "Notifications", icon: "lucide-bell" },
        { id: "imports", title: "Imports", icon: "lucide-package" },
      ],
    });

    const input = wrapper.find(".vc-input__input");
    await input.setValue("notif");
    await nextTick();

    expect(wrapper.findAll(".app-hub-content__item--app")).toHaveLength(0);
    expect(wrapper.findAll(".app-hub-content__item--widget")).toHaveLength(1);
    expect(wrapper.text()).toContain("Notifications");
  });

  it("emits switch-app on application click", async () => {
    const wrapper = mountHub({
      apps: [{ id: "reports", title: "Reports" } as AppDescriptor],
    });

    expect(wrapper.find("[data-test-id='app-hub-app-reports']").exists()).toBe(true);

    await wrapper.find(".app-hub-content__item--app").trigger("click");

    expect(wrapper.emitted("switch-app")).toBeTruthy();
    const emittedApp = wrapper.emitted("switch-app")?.[0]?.[0] as AppDescriptor;
    expect(emittedApp.id).toBe("reports");
  });

  it("opens widget flyout for component widgets", async () => {
    const WidgetComponent = defineComponent({
      template: "<div data-test='widget-component'>Widget content</div>",
    });

    const wrapper = mountHub({
      widgets: [
        {
          id: "notification-dropdown",
          title: "Notifications",
          icon: "lucide-bell",
          component: markRaw(WidgetComponent),
        },
      ],
    });

    await wrapper.find(".app-hub-content__item--widget").trigger("click");
    await nextTick();

    expect(document.body.querySelector("[data-test='widget-component']")).not.toBeNull();
  });

  it("falls back to a humanized widget id when title is missing", () => {
    const wrapper = mountHub({
      widgets: [{ id: "import_app", icon: "lucide-package" }],
    });

    expect(wrapper.text()).toContain("Import App");
  });

  it("always renders applications in tiles mode", () => {
    const apps = Array.from({ length: 3 }, (_, index) => ({
      id: `app-${index + 1}`,
      title: `App ${index + 1}`,
    })) as AppDescriptor[];

    const wrapper = mountHub({ apps });

    expect(wrapper.find(".app-hub-content__apps-list--tiles").exists()).toBe(true);
  });

  it("progressively renders large application lists", () => {
    const apps = Array.from({ length: 180 }, (_, index) => ({
      id: `app-${index + 1}`,
      title: `App ${index + 1}`,
    })) as AppDescriptor[];

    const wrapper = mountHub({ apps });

    expect(wrapper.findAll(".app-hub-content__item--app")).toHaveLength(120);
  });

  it("renders separate scroll containers for applications and widgets", () => {
    const wrapper = mountHub({
      apps: [{ id: "commerce", title: "Commerce Manager" } as AppDescriptor],
      widgets: [{ id: "imports", title: "Imports", icon: "lucide-package" }],
    });

    const sections = wrapper.findAll(".app-hub-content__section");
    expect(sections).toHaveLength(2);

    const appsScroll = sections[0].find(".vc-scrollable-container");
    const widgetsScroll = sections[1].find(".vc-scrollable-container");

    expect(appsScroll.exists()).toBe(true);
    expect(widgetsScroll.exists()).toBe(true);
  });
});
