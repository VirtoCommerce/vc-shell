import { describe, it, expect } from "vitest";
import {
  toKebabCase,
  toPascalCase,
  toCamelCase,
  toScreamingSnakeCase,
  toSentenceCase,
  isValidPackageName,
  toValidPackageName,
  toValidBasePath,
  buildTemplateData,
} from "./helpers.js";

describe("toKebabCase", () => {
  it("converts PascalCase", () => {
    expect(toKebabCase("MyModule")).toBe("my-module");
  });

  it("converts spaces", () => {
    expect(toKebabCase("My Module Name")).toBe("my-module-name");
  });

  it("strips invalid chars", () => {
    expect(toKebabCase("My App!@#")).toBe("my-app");
  });

  it("handles already kebab", () => {
    expect(toKebabCase("my-module")).toBe("my-module");
  });
});

describe("toPascalCase", () => {
  it("converts kebab-case", () => {
    expect(toPascalCase("my-module")).toBe("MyModule");
  });

  it("converts spaces", () => {
    expect(toPascalCase("order items")).toBe("OrderItems");
  });
});

describe("toCamelCase", () => {
  it("converts kebab-case", () => {
    expect(toCamelCase("my-module")).toBe("myModule");
  });
});

describe("toScreamingSnakeCase", () => {
  it("converts kebab-case", () => {
    expect(toScreamingSnakeCase("my-module")).toBe("MY_MODULE");
  });

  it("converts PascalCase", () => {
    expect(toScreamingSnakeCase("MyModule")).toBe("MY_MODULE");
  });

  it("converts spaces", () => {
    expect(toScreamingSnakeCase("Order Items")).toBe("ORDER_ITEMS");
  });
});

describe("toSentenceCase", () => {
  it("converts kebab-case", () => {
    expect(toSentenceCase("my-module")).toBe("My Module");
  });

  it("converts underscores", () => {
    expect(toSentenceCase("order_items")).toBe("Order Items");
  });
});

describe("isValidPackageName", () => {
  it("accepts valid names", () => {
    expect(isValidPackageName("my-app")).toBe(true);
    expect(isValidPackageName("@scope/my-app")).toBe(true);
  });

  it("rejects invalid names", () => {
    expect(isValidPackageName("My App")).toBe(false);
    expect(isValidPackageName(".hidden")).toBe(false);
  });
});

describe("toValidPackageName", () => {
  it("converts to valid name", () => {
    expect(toValidPackageName("My App")).toBe("my-app");
    expect(toValidPackageName(".hidden")).toBe("hidden");
  });
});

describe("toValidBasePath", () => {
  it("normalizes slashes", () => {
    expect(toValidBasePath("/apps//my-app")).toBe("/apps/my-app/");
  });

  it("ensures trailing slash", () => {
    expect(toValidBasePath("/apps/my-app")).toBe("/apps/my-app/");
  });
});

describe("buildTemplateData", () => {
  it("generates module name variants", () => {
    const data = buildTemplateData({ moduleName: "Order Items" });
    expect(data.ModuleName).toBe("order-items");
    expect(data.ModuleNamePascalCase).toBe("OrderItems");
    expect(data.ModuleNameCamelCase).toBe("orderItems");
    expect(data.ModuleNameScreamingSnake).toBe("ORDER_ITEMS");
    expect(data.ModuleNameSentenceCase).toBe("Order Items");
    expect(data.hasModule).toBe(true);
  });

  it("sets hasModule false when no moduleName", () => {
    const data = buildTemplateData({ moduleName: undefined, packageName: "test" });
    expect(data.hasModule).toBe(false);
    expect(data.ModuleName).toBe("");
    expect(data.ModuleNamePascalCase).toBe("");
  });

  it("includes project-level data when packageName provided", () => {
    const data = buildTemplateData({
      moduleName: "Orders",
      projectName: "my-app",
      packageName: "my-app",
      basePath: "/apps/my-app/",
      tenantRoutes: true,
      dashboard: true,
      mocks: false,
    });
    expect(data.AppName).toBe("my-app");
    expect(data.PackageName).toBe("my-app");
    expect(data.BasePath).toBe("/apps/my-app/");
    expect(data.tenantRoutes).toBe(true);
    expect(data.dashboard).toBe(true);
    expect(data.mocks).toBe(false);
  });
});
