import { describe, it, expect } from "vitest";
import { coreTransform } from "../../../src/transforms/nswag-class-to-interface-core";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";

const dtoClassNames = new Set(["Offer", "PushMessage", "SearchResult", "ImportProfile", "Image"]);
const interfaceToClass = new Map<string, string>([["IOffer", "Offer"]]);

const defaultOptions = {
  dtoClassNames,
  interfaceToClass,
};

function transformWithReports(source: string, path = "test.ts") {
  return applyTransformWithReports(
    (fileInfo, api, options) => coreTransform(fileInfo, api, options),
    { path, source },
    { dtoClassNames, interfaceToClass },
  );
}

describe("nswag-class-to-interface-core — Rule C (empty constructor)", () => {
  it("replaces `new Offer()` with `{} as Offer` when Offer is imported from api_client", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { Offer } from "../api_client";
const offer = new Offer();`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });

  it("handles `reactive(new PushMessage())`", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { PushMessage } from "../api_client";
import { reactive } from "vue";
const msg = reactive(new PushMessage());`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("reactive({} as PushMessage)");
    expect(result).not.toContain("new PushMessage()");
  });

  it("handles `ref<Offer>(reactive(new Offer()))`", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { Offer } from "../api_client";
import { ref, reactive } from "vue";
const offer = ref<Offer>(reactive(new Offer()));`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });

  it("does NOT transform Client classes (not in dtoClassNames)", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { OfferClient } from "../api_client";
const client = new OfferClient();`,
      },
      defaultOptions,
    );
    expect(result).toBeNull();
  });

  it("does NOT transform non-api_client imports", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { Offer } from "../some-other-module";
const offer = new Offer();`,
      },
      defaultOptions,
    );
    expect(result).toBeNull();
  });
});

describe("nswag-class-to-interface-core — Rule A (object literal argument)", () => {
  it("unwraps object literal from constructor: new ImportProfile({...}) → {...} as ImportProfile", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile({ id: "123", name: "Test" });`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain('{ id: "123", name: "Test" } as ImportProfile');
    expect(result).not.toContain("new ImportProfile");
  });

  it("handles nested new expressions recursively", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile({ settings: [new ImportProfile()] });`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).not.toContain("new ImportProfile");
    expect(result).toContain("{} as ImportProfile");
    expect(result).toContain("as ImportProfile");
  });
});

describe("nswag-class-to-interface-core — Rule B (variable argument)", () => {
  it("spreads variable argument: new PushMessage(variable) → { ...variable } as PushMessage", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { PushMessage } from "../api_client";
const msg = new PushMessage(currentValue.value);`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("...currentValue.value");
    expect(result).toContain("as PushMessage");
    expect(result).not.toContain("new PushMessage");
  });

  it("wraps in parens inside arrow function expression", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { ImportProfile } from "../api_client";
const items = settings.map(s => new ImportProfile(s));`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("...s");
    expect(result).toContain("as ImportProfile)");
    expect(result).not.toContain("new ImportProfile");
  });

  it("treats undefined arg as Rule C (empty object)", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { Offer } from "../api_client";
const offer = new Offer(undefined);`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer");
  });

  it("treats null arg as Rule C (empty object)", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { Offer } from "../api_client";
const offer = new Offer(null);`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer");
  });
});

describe("nswag-class-to-interface-core — Rule D (IPrefix type removal)", () => {
  it("renames IOffer to Offer in import and type annotations", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { IOffer } from "../../api_client/virtocommerce.mymodule";
const item = ref<IOffer>();
function process(data: IOffer): IOffer { return data; }`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).not.toContain("IOffer");
    expect(result).toContain("import { Offer }");
    expect(result).toContain("ref<Offer>");
    expect(result).toContain("data: Offer): Offer");
  });
});

describe("nswag-class-to-interface-core — Rule E (import deduplication)", () => {
  it("merges IOffer + Offer into single Offer import", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { IOffer, Offer, VcmpSellerCatalogClient } from "../../api_client/virtocommerce.mymodule";
const item = ref<IOffer>(new Offer());`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).not.toContain("IOffer");
    expect(result).toContain("Offer");
    expect(result).toContain("VcmpSellerCatalogClient");
    // Offer should appear exactly once in import specifiers
    const importLine = result!.split("\n").find((l: string) => l.startsWith("import"));
    const offerCount = (importLine!.match(/\bOffer\b/g) || []).length;
    expect(offerCount).toBe(1);
  });
});

describe("nswag-class-to-interface-core — Rule D + Rule C combined", () => {
  it("renames IOffer and replaces new Offer() in same file", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { IOffer, Offer } from "../../api_client/virtocommerce.mymodule";
const item = ref<IOffer>(new Offer());`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).not.toContain("IOffer");
    expect(result).toContain("ref<Offer>");
    expect(result).toContain("{} as Offer");
  });
});

describe("nswag-class-to-interface-core — Parent TSAsExpression collapse", () => {
  it("collapses double cast: new ImportProfile() as ExtProfile → {} as ExtProfile", () => {
    const result = applyTransform(
      coreTransform,
      {
        path: "test.ts",
        source: `import { ImportProfile } from "../api_client";
const profile = new ImportProfile() as ExtProfile;`,
      },
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result).toContain("{} as ExtProfile");
    expect(result).not.toContain("new ImportProfile");
    expect(result).not.toContain("as ImportProfile");
  });
});

describe("nswag-class-to-interface-core — Rule F (diagnostics)", () => {
  it("reports .fromJS() usage when DTO is imported from api_client", () => {
    const { reports } = transformWithReports(
      `import { Offer } from "../api_client";
const offer = Offer.fromJS(data);`,
    );
    expect(reports.some((r) => r.includes("fromJS"))).toBe(true);
  });

  it("reports .toJSON() usage when DTO is imported from api_client", () => {
    const { reports } = transformWithReports(
      `import { Offer } from "../api_client";
const json = offer.toJSON();`,
    );
    expect(reports.some((r) => r.includes("toJSON"))).toBe(true);
  });

  it("reports Image import conflict with DOM global", () => {
    const { reports } = transformWithReports(
      `import { Image } from "../../api_client/virtocommerce.platform";
const img = new Image();`,
    );
    expect(reports.some((r) => r.includes("Image") && r.includes("DOM"))).toBe(true);
  });
});

describe("nswag-class-to-interface-core — Rule G (clone-then-mutate)", () => {
  it("does NOT replace new PushMessage() when followed by property assignments", () => {
    const { result, reports } = transformWithReports(
      `import { PushMessage } from "../api_client";
const cloned = new PushMessage();
cloned.topic = "test";
cloned.shortMessage = "hello";`,
    );
    // Should NOT transform the new expression
    if (result !== null) {
      expect(result).toContain("new PushMessage()");
    }
    // Should emit a diagnostic
    expect(reports.some((r) => r.includes("Clone-then-mutate"))).toBe(true);
  });
});

describe("Vue SFC support", () => {
  it("transforms script content from .vue file", () => {
    // coreTransform receives only the script content, not the full SFC
    // The path ending in .vue is just for reporting
    const result = applyTransform(
      (fileInfo, api, options) => coreTransform(fileInfo, api, options),
      {
        path: "components/test.vue",
        source: `import { Offer } from "../../api_client/virtocommerce.mymodule";
const item = new Offer();`,
      },
      defaultOptions,
    );
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });
});

describe("Package import matching", () => {
  it("matches imports from package name", () => {
    const result = applyTransform(
      (fileInfo, api, options) => coreTransform(fileInfo, api, options),
      {
        path: "test.ts",
        source: `import { Offer } from "@my-app/api/mymodule";
const x = new Offer();`,
      },
      {
        dtoClassNames,
        interfaceToClass,
        packageName: "@my-app/api",
      },
    );
    expect(result).toContain("{} as Offer");
    expect(result).not.toContain("new Offer()");
  });

  it("does NOT match unrelated packages", () => {
    const result = applyTransform(
      (fileInfo, api, options) => coreTransform(fileInfo, api, options),
      {
        path: "test.ts",
        source: `import { Offer } from "@some-other/package";
const x = new Offer();`,
      },
      {
        dtoClassNames,
        interfaceToClass,
        packageName: "@my-app/api",
      },
    );
    expect(result).toBeNull();
  });
});
