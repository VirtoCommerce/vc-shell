import { describe, it, expect, beforeEach } from "vitest";
import {
  createWorkspaceDescriptor,
  createChildDescriptor,
  createReplacementDescriptor,
  createCoveringDescriptor,
  type DescriptorFactoryContext,
} from "@core/blade-navigation/descriptorFactory";
import type { BladeOpenEvent } from "@core/blade-navigation/types";

// Deterministic factory context for assertions.
function makeCtx(): DescriptorFactoryContext {
  let counter = 0;
  return {
    generateId: () => `id_${++counter}`,
    resolveUrl: (name: string) => (name === "NoUrl" ? undefined : `/${name.toLowerCase()}`),
  };
}

const fullEvent: BladeOpenEvent = {
  name: "Orders",
  param: "42",
  query: { tab: "open" },
  options: { context: "large" },
};

describe("descriptorFactory", () => {
  let ctx: DescriptorFactoryContext;

  beforeEach(() => {
    ctx = makeCtx();
  });

  describe("createWorkspaceDescriptor", () => {
    it("has no parentId, is visible, resolves url, drops param", () => {
      const d = createWorkspaceDescriptor(fullEvent, ctx);

      expect(d.parentId).toBeUndefined();
      expect(d.visible).toBe(true);
      expect(d.url).toBe("/orders");
      expect(d.name).toBe("Orders");
      // workspace descriptors never carry param
      expect(d.param).toBeUndefined();
      expect(d.query).toEqual({ tab: "open" });
      expect(d.options).toEqual({ context: "large" });
      expect(d.id).toBe("id_1");
    });

    it("resolves undefined url when registry has none", () => {
      const d = createWorkspaceDescriptor({ name: "NoUrl" }, ctx);
      expect(d.url).toBeUndefined();
    });
  });

  describe("createChildDescriptor", () => {
    it("sets parentId to the opener, keeps param, is visible", () => {
      const d = createChildDescriptor(fullEvent, "parent_1", ctx);

      expect(d.parentId).toBe("parent_1");
      expect(d.visible).toBe(true);
      expect(d.param).toBe("42");
      expect(d.url).toBe("/orders");
      expect(d.query).toEqual({ tab: "open" });
      expect(d.options).toEqual({ context: "large" });
    });
  });

  describe("createReplacementDescriptor", () => {
    it("keeps the replaced blade's parent (same hierarchy position)", () => {
      const d = createReplacementDescriptor(fullEvent, "grandparent_1", ctx);

      expect(d.parentId).toBe("grandparent_1");
      expect(d.visible).toBe(true);
      expect(d.param).toBe("42");
    });

    it("keeps undefined parent when replacing a workspace-level blade", () => {
      const d = createReplacementDescriptor(fullEvent, undefined, ctx);
      expect(d.parentId).toBeUndefined();
    });
  });

  describe("createCoveringDescriptor", () => {
    it("sets parentId to the hidden blade so callParent reaches it", () => {
      const d = createCoveringDescriptor(fullEvent, "hidden_1", ctx);

      expect(d.parentId).toBe("hidden_1");
      expect(d.visible).toBe(true);
      expect(d.param).toBe("42");
    });
  });

  it("each factory mints a unique id via the context", () => {
    const a = createWorkspaceDescriptor(fullEvent, ctx);
    const b = createChildDescriptor(fullEvent, "p", ctx);
    const c = createReplacementDescriptor(fullEvent, "p", ctx);
    const d = createCoveringDescriptor(fullEvent, "p", ctx);

    expect(new Set([a.id, b.id, c.id, d.id]).size).toBe(4);
  });
});
