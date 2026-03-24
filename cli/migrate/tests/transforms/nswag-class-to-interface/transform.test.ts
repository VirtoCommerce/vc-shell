import { describe, it, expect } from "vitest";
import { coreTransform } from "../../../src/transforms/nswag-class-to-interface-core";
import { applyTransform } from "../../../src/utils/test-helpers";

const dtoClassNames = new Set(["Offer", "PushMessage", "SearchResult"]);
const interfaceToClass = new Map<string, string>();

const defaultOptions = {
  dtoClassNames,
  interfaceToClass,
};

describe("nswag-class-to-interface-core — Rule C (empty constructor)", () => {
  it("replaces `new Offer()` with `{} as Offer` when Offer is imported from api_client", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { Offer } from "../api_client";
const offer = new Offer();`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });

  it("handles `reactive(new PushMessage())`", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { PushMessage } from "../api_client";
import { reactive } from "vue";
const msg = reactive(new PushMessage());`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("reactive({} as PushMessage)");
    expect(result).not.toContain("new PushMessage()");
  });

  it("handles `ref<Offer>(reactive(new Offer()))`", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { Offer } from "../api_client";
import { ref, reactive } from "vue";
const offer = ref<Offer>(reactive(new Offer()));`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });

  it("does NOT transform Client classes (not in dtoClassNames)", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { OfferClient } from "../api_client";
const client = new OfferClient();`,
    }, defaultOptions);
    expect(result).toBeNull();
  });

  it("does NOT transform non-api_client imports", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { Offer } from "../some-other-module";
const offer = new Offer();`,
    }, defaultOptions);
    expect(result).toBeNull();
  });
});
