import { describe, it, expect, beforeEach, vi } from "vitest";
import { computed } from "vue";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import { buildUrlFromStack } from "@core/blade-navigation/utils/urlSync";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack, UrlSink } from "@core/blade-navigation/types";

/**
 * The stack owns URL sync: after every navigation action it names the verb
 * (push for opens, replace for closes) and the sink resolves the location from
 * the stack. These cases pin the verb and the resulting URL for each action —
 * the parity contract with the manual `syncUrl*()` calls the actions replaced.
 */

// ── Registry ───────────────────────────────────────────────────────────────────

function createMockRegistry(
  blades: Record<string, { route?: string; isWorkspace?: boolean; permissions?: string | string[] }> = {},
): IBladeRegistry {
  const map = new Map(
    Object.entries(blades).map(([name, data]) => [
      name,
      {
        component: {} as any,
        route: data.route,
        isWorkspace: data.isWorkspace ?? false,
        permissions: data.permissions,
      },
    ]),
  );

  return {
    registeredBladesMap: computed(() => map),
    getBlade: (name: string) => map.get(name),
    getBladeComponent: (name: string) => map.get(name)?.component,
    getBladeByRoute: (route: string) => {
      const normalized = route.replace(/^\/+/, "");
      for (const [name, data] of map.entries()) {
        if (data.route?.replace(/^\/+/, "") === normalized) return { name, data };
      }
      return undefined;
    },
  };
}

function registry() {
  return createMockRegistry({
    Orders: { route: "/orders", isWorkspace: true },
    OrderDetails: { route: "/order" },
    Notes: {}, // no route → descriptor has no url → open must not touch the URL
    Secret: { route: "/secret", isWorkspace: true, permissions: "admin" },
  });
}

// ── Recording sink ─────────────────────────────────────────────────────────────

interface Recorded {
  verb: "push" | "replace";
  path: string;
  query: Record<string, string>;
}

function createRecordingSink(): { sink: UrlSink; calls: Recorded[]; bind(stack: IBladeStack): void } {
  const calls: Recorded[] = [];
  let bound: IBladeStack | undefined;

  function record(verb: "push" | "replace") {
    // The real sink builds the location the same way, from the same stack, at
    // the same moment — so recording it here proves what the router would get.
    const { path, query } = buildUrlFromStack("", bound!.blades.value);
    calls.push({ verb, path, query });
  }

  return {
    calls,
    bind: (stack) => (bound = stack),
    sink: { push: () => record("push"), replace: () => record("replace") },
  };
}

function verbs(calls: Recorded[]): string[] {
  return calls.map((c) => `${c.verb} ${c.path}`);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("createBladeStack — URL sink", () => {
  let stack: IBladeStack;
  let recorder: ReturnType<typeof createRecordingSink>;

  beforeEach(() => {
    recorder = createRecordingSink();
    stack = createBladeStack(registry(), undefined, recorder.sink);
    recorder.bind(stack);
  });

  describe("open verbs push", () => {
    it("openWorkspace pushes the workspace URL", async () => {
      await stack.openWorkspace({ name: "Orders" });

      expect(verbs(recorder.calls)).toEqual(["push /orders"]);
    });

    it("openBlade pushes workspace + blade + param", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });

      expect(verbs(recorder.calls)).toEqual(["push /orders", "push /orders/order/1"]);
    });

    it("coverCurrentBlade pushes the covering blade URL", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.coverCurrentBlade({ name: "OrderDetails", param: "7" });

      expect(verbs(recorder.calls)).toEqual(["push /orders/order/7"]);
    });

    it("replaceCurrentBlade replaces instead of pushing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      recorder.calls.length = 0;

      await stack.replaceCurrentBlade({ name: "OrderDetails", param: "2" });

      expect(verbs(recorder.calls)).toEqual(["replace /orders/order/2"]);
    });

    it("carries blade query into the pushed location", async () => {
      await stack.openWorkspace({ name: "Orders" });
      stack.updateBladeQuery(stack.workspace.value!.id, { orders_sort: "name:ASC" });
      recorder.calls.length = 0;

      await stack.openBlade({ name: "OrderDetails", param: "1" });

      expect(recorder.calls).toEqual([{ verb: "push", path: "/orders/order/1", query: { orders_sort: "name:ASC" } }]);
    });
  });

  describe("blades without a url leave the address bar alone", () => {
    it("openBlade of a url-less blade records nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.openBlade({ name: "Notes" });

      expect(recorder.calls).toEqual([]);
      expect(stack.activeBlade.value?.name).toBe("Notes");
    });

    it("coverCurrentBlade with a url-less blade records nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.coverCurrentBlade({ name: "Notes" });

      expect(recorder.calls).toEqual([]);
    });

    it("replaceCurrentBlade with a url-less blade records nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      recorder.calls.length = 0;

      await stack.replaceCurrentBlade({ name: "Notes" });

      expect(recorder.calls).toEqual([]);
    });
  });

  describe("close verbs replace", () => {
    it("closeBlade replaces with the shortened stack URL", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      recorder.calls.length = 0;

      const prevented = await stack.closeBlade(stack.activeBlade.value!.id);

      expect(prevented).toBe(false);
      expect(verbs(recorder.calls)).toEqual(["replace /orders"]);
    });

    it("closeBlade records nothing when a guard prevents the close", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      const childId = stack.activeBlade.value!.id;
      stack.registerBeforeClose(childId, async () => true);
      recorder.calls.length = 0;

      const prevented = await stack.closeBlade(childId);

      expect(prevented).toBe(true);
      expect(recorder.calls).toEqual([]);
    });

    it("closeChildren replaces even when there are no children", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.closeChildren(stack.workspace.value!.id);

      expect(verbs(recorder.calls)).toEqual(["replace /orders"]);
    });

    it("closeChildren replaces even when a guard prevents the close", async () => {
      await stack.openWorkspace({ name: "Orders" });
      const workspaceId = stack.workspace.value!.id;
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      stack.registerBeforeClose(stack.activeBlade.value!.id, async () => true);
      recorder.calls.length = 0;

      await stack.closeChildren(workspaceId);

      expect(stack.blades.value).toHaveLength(2);
      expect(verbs(recorder.calls)).toEqual(["replace /orders/order/1"]);
    });

    it("closeChildren of an unknown parent still replaces", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.closeChildren("nope");

      expect(verbs(recorder.calls)).toEqual(["replace /orders"]);
    });

    it("closeChildren replaces after closing children", async () => {
      await stack.openWorkspace({ name: "Orders" });
      const workspaceId = stack.workspace.value!.id;
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      recorder.calls.length = 0;

      await stack.closeChildren(workspaceId);

      expect(verbs(recorder.calls)).toEqual(["replace /orders"]);
      expect(stack.blades.value).toHaveLength(1);
    });
  });

  describe("actions that changed nothing leave the history alone", () => {
    it("openWorkspace with the same workspace records nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await stack.openWorkspace({ name: "Orders" });

      expect(recorder.calls).toEqual([]);
      expect(stack.blades.value).toHaveLength(1);
    });

    it("clicking the same workspace repeatedly adds one history entry", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openWorkspace({ name: "Orders" });
      await stack.openWorkspace({ name: "Orders" });

      expect(verbs(recorder.calls)).toEqual(["push /orders"]);
    });

    it("openBlade still pushes when a child guard prevented the open", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      stack.registerBeforeClose(stack.activeBlade.value!.id, async () => true);
      recorder.calls.length = 0;

      await stack.openBlade({ name: "OrderDetails", param: "2", parentId: stack.workspace.value!.id });

      // Stack unchanged, so the location is still the existing child's.
      expect(verbs(recorder.calls)).toEqual(["push /orders/order/1"]);
    });

    it("closeBlade of an unknown id records nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      const prevented = await stack.closeBlade("nope");

      expect(prevented).toBe(false);
      expect(recorder.calls).toEqual([]);
    });

    it("closeBlade of the workspace records nothing", async () => {
      // The workspace blade cannot be closed. Rewriting the URL for that
      // refusal would replace the history entry of a navigation that never was.
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });
      recorder.calls.length = 0;

      const prevented = await stack.closeBlade(stack.workspace.value!.id);

      expect(prevented).toBe(false);
      expect(recorder.calls).toEqual([]);
      expect(stack.blades.value).toHaveLength(2);
    });

    it("records nothing when the action throws", async () => {
      await stack.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await expect(stack.openBlade({ name: "Unregistered" })).rejects.toThrow();

      expect(recorder.calls).toEqual([]);
    });

    it("a denied workspace leaves the stack and the URL where they were", async () => {
      const denied = createBladeStack(registry(), (p) => p !== "admin", recorder.sink);
      recorder.bind(denied);
      vi.spyOn(console, "warn").mockImplementation(() => {});
      await denied.openWorkspace({ name: "Orders" });
      recorder.calls.length = 0;

      await denied.openWorkspace({ name: "Secret" });

      expect(denied.workspace.value?.name).toBe("Orders");
      expect(recorder.calls).toEqual([]);
    });

    it("records nothing when the denied workspace is the first one", async () => {
      const denied = createBladeStack(registry(), () => false, recorder.sink);
      recorder.bind(denied);
      vi.spyOn(console, "warn").mockImplementation(() => {});

      await denied.openWorkspace({ name: "Secret" });

      expect(denied.blades.value).toEqual([]);
      expect(recorder.calls).toEqual([]);
    });
  });

  describe("non-navigation mutations never touch the URL", () => {
    it("query, title, error and restore record nothing", async () => {
      await stack.openWorkspace({ name: "Orders" });
      const id = stack.workspace.value!.id;
      recorder.calls.length = 0;

      stack.updateBladeQuery(id, { orders_page: "2" });
      stack.setBladeTitle(id, "Orders list");
      stack.setBladeError(id, new Error("boom"));
      stack.clearBladeError(id);
      stack.setMaximized(id, true);
      stack._restoreStack([]);

      expect(recorder.calls).toEqual([]);
    });
  });

  describe("default sink", () => {
    it("a stack built without a sink runs every action without throwing", async () => {
      const plain = createBladeStack(registry());

      await plain.openWorkspace({ name: "Orders" });
      await plain.openBlade({ name: "OrderDetails", param: "1" });
      await plain.coverCurrentBlade({ name: "OrderDetails", param: "2" });
      await plain.replaceCurrentBlade({ name: "OrderDetails", param: "3" });
      await plain.closeBlade(plain.activeBlade.value!.id);
      await plain.closeChildren(plain.workspace.value!.id);

      expect(plain.blades.value).toHaveLength(1);
    });
  });
});
