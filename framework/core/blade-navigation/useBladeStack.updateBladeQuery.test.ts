import { describe, it, expect } from "vitest";
import { createBladeStack } from "./useBladeStack";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";

// Minimal registry: openWorkspace needs getBlade(name) to return a blade with a route.
const registry = {
  getBlade: (name: string) => ({ name, route: "/offers", isWorkspace: true, permissions: undefined }),
} as unknown as IBladeRegistry;

async function makeStackWithWorkspace() {
  const stack = createBladeStack(registry);
  await stack.openWorkspace({ name: "Offers" });
  return stack;
}

describe("bladeStack.updateBladeQuery", () => {
  it("merges patch into the descriptor query", async () => {
    const stack = await makeStackWithWorkspace();
    const id = stack.workspace.value!.id;

    stack.updateBladeQuery(id, { offers_sort: "name:DESC", offers_page: "2" });

    expect(stack.blades.value[0].query).toEqual({ offers_sort: "name:DESC", offers_page: "2" });
  });

  it("strips keys whose value is empty string", async () => {
    const stack = await makeStackWithWorkspace();
    const id = stack.workspace.value!.id;

    stack.updateBladeQuery(id, { offers_sort: "name:DESC" });
    stack.updateBladeQuery(id, { offers_sort: "" });

    expect(stack.blades.value[0].query).toEqual({});
  });

  it("is a no-op for an unknown blade id", async () => {
    const stack = await makeStackWithWorkspace();
    expect(() => stack.updateBladeQuery("missing", { offers_page: "1" })).not.toThrow();
    expect(stack.blades.value[0].query).toBeUndefined();
  });
});
