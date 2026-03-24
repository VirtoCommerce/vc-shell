import { describe, it, expect } from "vitest";
import { coreTransform } from "../../../src/transforms/nswag-class-to-interface-core";
import { applyTransform } from "../../../src/utils/test-helpers";

const dtoClassNames = new Set(["Offer", "PushMessage", "SearchResult", "ImportProfile"]);
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

describe("nswag-class-to-interface-core — Rule A (object literal argument)", () => {
  it("unwraps object literal from constructor: new ImportProfile({...}) → {...} as ImportProfile", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile({ id: "123", name: "Test" });`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain('{ id: "123", name: "Test" } as ImportProfile');
    expect(result).not.toContain("new ImportProfile");
  });

  it("handles nested new expressions recursively", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile({ settings: [new ImportProfile()] });`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).not.toContain("new ImportProfile");
    expect(result).toContain("{} as ImportProfile");
    expect(result).toContain("as ImportProfile");
  });
});

describe("nswag-class-to-interface-core — Rule B (variable argument)", () => {
  it("spreads variable argument: new PushMessage(variable) → { ...variable } as PushMessage", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { PushMessage } from "../api_client";
const msg = new PushMessage(currentValue.value);`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("...currentValue.value");
    expect(result).toContain("as PushMessage");
    expect(result).not.toContain("new PushMessage");
  });

  it("wraps in parens inside arrow function expression", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { ImportProfile } from "../api_client";
const items = settings.map(s => new ImportProfile(s));`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("...s");
    expect(result).toContain("as ImportProfile)");
    expect(result).not.toContain("new ImportProfile");
  });

  it("treats undefined arg as Rule C (empty object)", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { Offer } from "../api_client";
const offer = new Offer(undefined);`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer");
  });

  it("treats null arg as Rule C (empty object)", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { Offer } from "../api_client";
const offer = new Offer(null);`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer");
  });
});

describe("nswag-class-to-interface-core — Parent TSAsExpression collapse", () => {
  it("collapses double cast: new ImportProfile() as ExtProfile → {} as ExtProfile", () => {
    const result = applyTransform(coreTransform, {
      path: "test.ts",
      source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile() as ExtProfile;`,
    }, defaultOptions);
    expect(result).not.toBeNull();
    expect(result).toContain("{} as ExtProfile");
    expect(result).not.toContain("new ImportProfile");
    expect(result).not.toContain("as ImportProfile");
  });
});
