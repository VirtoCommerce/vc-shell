import { describe, it, expect, vi, afterEach } from "vitest";
import { effectScope, type EffectScope } from "vue";
import type { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "@core/notifications";
import { useWidgetPushAlerts, type UseWidgetPushAlertsOptions } from ".";

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
  entityId?: string;
  messageId?: string;
  content?: string;
}

let counter = 0;

function push(overrides: Partial<MessagePush> = {}): MessagePush {
  counter++;
  return {
    id: `n-${counter}`,
    notifyType: "MessagePushNotification",
    isNew: true,
    created: new Date(),
    entityId: "order-1",
    messageId: `m-${counter}`,
    content: `text ${counter}`,
    ...overrides,
  } as MessagePush;
}

const scopes: EffectScope[] = [];

function setup(overrides: Partial<UseWidgetPushAlertsOptions<MessagePush>> = {}) {
  const scope = effectScope();
  scopes.push(scope);
  const result = scope.run(() =>
    useWidgetPushAlerts<MessagePush>({
      types: ["MessagePushNotification"],
      filter: (m) => m.entityId === "order-1",
      toAlert: (m) => ({ id: m.messageId!, severity: "info", text: m.content ?? "" }),
      ...overrides,
    }),
  )!;
  return { ...result, scope };
}

afterEach(() => {
  scopes.splice(0).forEach((s) => s.stop());
  vi.restoreAllMocks();
});

describe("useWidgetPushAlerts", () => {
  it("adds alert from matching push", () => {
    const { alerts } = setup();
    useNotificationStore().ingest(push({ messageId: "m-a", content: "Hello" }));

    expect(alerts.value).toHaveLength(1);
    expect(alerts.value[0]).toMatchObject({ id: "m-a", severity: "info", text: "Hello" });
  });

  it("ignores messages rejected by filter", () => {
    const { alerts } = setup();
    useNotificationStore().ingest(push({ entityId: "order-2" }));
    useNotificationStore().ingest(push({ notifyType: "OtherEvent" }));

    expect(alerts.value).toHaveLength(0);
  });

  it("onSeen removes the alert", () => {
    const { alerts } = setup();
    useNotificationStore().ingest(push({ messageId: "m-a" }));
    useNotificationStore().ingest(push({ messageId: "m-b" }));

    alerts.value.find((a) => a.id === "m-a")!.onSeen!();

    expect(alerts.value.map((a) => a.id)).toEqual(["m-b"]);
  });

  it("same id replaces, newest first", () => {
    const { alerts } = setup();
    useNotificationStore().ingest(push({ messageId: "m-a", content: "first" }));
    useNotificationStore().ingest(push({ messageId: "m-b" }));
    useNotificationStore().ingest(push({ messageId: "m-a", content: "edited" }));

    expect(alerts.value.map((a) => a.id)).toEqual(["m-a", "m-b"]);
    expect(alerts.value[0].text).toBe("edited");
  });

  it("does not mark notification as read", () => {
    const store = useNotificationStore();
    const markAsRead = vi.spyOn(store, "markAsRead");
    const { alerts } = setup();
    store.ingest(push({ messageId: "m-a" }));

    alerts.value[0].onSeen!();

    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("clear removes all alerts", () => {
    const { alerts, clear } = setup();
    useNotificationStore().ingest(push());
    useNotificationStore().ingest(push());

    clear();

    expect(alerts.value).toHaveLength(0);
  });

  it("unsubscribes on scope dispose", () => {
    const { alerts, scope } = setup();
    scope.stop();
    useNotificationStore().ingest(push());

    expect(alerts.value).toHaveLength(0);
  });
});
