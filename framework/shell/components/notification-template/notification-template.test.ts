import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import NotificationTemplate from "./notification-template.vue";

// Stub VcIcon
const stubs = {
  VcIcon: { name: "VcIcon", template: "<i class='vc-icon-stub' />", props: ["icon", "size"] },
};

const globalConfig = {
  provide: {
    [IsMobileKey as symbol]: ref(false),
    [IsDesktopKey as symbol]: ref(true),
  },
};

const baseNotification = {
  created: new Date().toISOString(),
};

describe("NotificationTemplate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-19T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the title", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Order placed", notification: baseNotification },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-notification-template__title").text()).toBe("Order placed");
  });

  it("renders the icon container", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-notification-template__icon-container").exists()).toBe(true);
    expect(wrapper.find(".vc-icon-stub").exists()).toBe(true);
  });

  it("applies custom background color to icon container", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification, color: "#ff0000" },
      global: { stubs, ...globalConfig },
    });
    const iconContainer = wrapper.find(".vc-notification-template__icon-container");
    expect(iconContainer.attributes("style")).toContain("background-color: rgb(255, 0, 0)");
  });

  it("uses default primary color when no color is provided", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      global: { stubs, ...globalConfig },
    });
    const iconContainer = wrapper.find(".vc-notification-template__icon-container");
    expect(iconContainer.attributes("style")).toContain("var(--primary-500)");
  });

  it("emits click when clicked", async () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      global: { stubs, ...globalConfig },
    });
    await wrapper.find(".vc-notification-template").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("renders default slot content in content-body", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      slots: { default: "<p class='extra'>Extra info</p>" },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-notification-template__content-body").exists()).toBe(true);
    expect(wrapper.find(".extra").text()).toBe("Extra info");
  });

  it("hides content-body when no default slot is provided", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-notification-template__content-body").exists()).toBe(false);
  });

  it("displays relative time for recent notification", () => {
    const tenMinutesAgo = new Date("2026-03-19T11:50:00Z").toISOString();
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: { created: tenMinutesAgo } },
      global: { stubs, ...globalConfig },
    });
    const timeText = wrapper.find(".vc-notification-template__time").text();
    // Should contain a relative time string (e.g. "10 minutes ago")
    expect(timeText.length).toBeGreaterThan(0);
  });

  it("displays empty string for notification with no created date", () => {
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: {} },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-notification-template__time").text()).toBe("");
  });

  it("applies mobile class when on mobile", () => {
    const mobileConfig = {
      provide: {
        [IsMobileKey as symbol]: ref(true),
        [IsDesktopKey as symbol]: ref(false),
      },
    };
    const wrapper = mount(NotificationTemplate, {
      props: { title: "Test", notification: baseNotification },
      global: { stubs, ...mobileConfig },
    });
    expect(wrapper.find(".vc-notification-template__container--mobile").exists()).toBe(true);
  });
});
