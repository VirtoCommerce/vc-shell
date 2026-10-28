import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, reactive, type EffectScope } from "vue";
import { mount } from "@vue/test-utils";
import type { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "@core/notifications";
import { useWidgetPushAlerts } from "@core/composables/useWidgetPushAlerts";
import { WidgetServiceKey } from "@framework/injection-keys";
import type { IWidget } from "@core/services/widget-service";
import WidgetItem from "./WidgetItem.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("@ui/composables/useTeleportTarget", () => ({ useTeleportTarget: () => ({ teleportTarget: "body" }) }));
vi.mock("@core/api/platform", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/api/platform")>();
  return {
    ...actual,
    PushNotificationClient: class {
      markAllAsRead = vi.fn().mockResolvedValue({ notifyEvents: [] });
      searchPushNotification = vi.fn().mockResolvedValue({ notifyEvents: [] });
    },
  };
});

interface MessagePush extends PushNotification {
  messageId?: string;
}

let scope: EffectScope;
const run = vi.fn();

function setup() {
  scope = effectScope();
  const { alerts } = scope.run(() =>
    useWidgetPushAlerts<MessagePush>({
      types: ["StoryMessage"],
      toAlert: (m) => ({
        id: m.messageId!,
        severity: "warning",
        text: `Msg ${m.messageId}`,
        action: { label: "Go", run },
      }),
    }),
  )!;
  const widget = reactive<IWidget>({ id: "w", title: "W", headless: { icon: "x", alerts } });
  useNotificationStore().ingest({
    id: "n-1",
    notifyType: "StoryMessage",
    isNew: true,
    created: new Date(),
    messageId: "m-1",
  } as MessagePush);
  const wrapper = mount(WidgetItem, {
    props: { widget: widget as IWidget, editing: false },
    attachTo: document.body,
    global: {
      provide: { [WidgetServiceKey as symbol]: { updateWidget: vi.fn() } },
      stubs: { Teleport: true },
      mocks: { $t: (k: string) => k },
    },
  });
  return { wrapper, alerts };
}

const flush = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
};

describe("WidgetItem + useWidgetPushAlerts", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("hover popover stays readable while open; alert is cleared on close", async () => {
    const { wrapper, alerts } = setup();
    expect(wrapper.find(".vc-widget__alert-dot").exists()).toBe(true);

    await wrapper.find(".vc-widget-item").trigger("mouseenter");
    vi.advanceTimersByTime(300);
    await flush(wrapper);
    vi.advanceTimersByTime(1000);
    await flush(wrapper);
    expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
    expect(wrapper.text()).toContain("Msg m-1");

    await wrapper.find(".vc-widget-alerts__action").trigger("click");
    expect(run).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);

    await wrapper.find(".vc-widget-item").trigger("mouseleave");
    vi.advanceTimersByTime(201);
    await flush(wrapper);
    expect(alerts.value).toHaveLength(0);
    expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    expect(wrapper.find(".vc-widget__alert-dot").exists()).toBe(false);
  });

  it("keyboard-opened popover keeps focus on its row after 1 s", async () => {
    const { wrapper, alerts } = setup();
    const trigger = wrapper.find(".vc-widget").element as HTMLElement;
    trigger.focus();
    await wrapper.find(".vc-widget").trigger("keydown", { key: "ArrowDown" });
    await flush(wrapper);
    vi.advanceTimersByTime(1000);
    await flush(wrapper);
    const row = wrapper.find(".vc-widget-alerts__open");
    expect(row.exists()).toBe(true);
    expect(document.activeElement).toBe(row.element);

    await row.trigger("click");
    await flush(wrapper);
    expect(alerts.value).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });
});
