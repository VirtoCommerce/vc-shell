import { describe, it, expect } from "vitest";
import { detectThemePreset, resolveEnvironment } from "./index";

describe("detectThemePreset", () => {
  it("detects prod from hostname", () => {
    expect(detectThemePreset("vcmp-prod.govirto.com")).toBe("prod");
  });

  it("detects dev from a dev hostname", () => {
    expect(detectThemePreset("vcmp-dev.govirto.com")).toBe("dev");
  });

  it("detects dev from localhost", () => {
    expect(detectThemePreset("localhost")).toBe("dev");
  });

  it("detects dev from an IP address", () => {
    expect(detectThemePreset("192.168.1.10")).toBe("dev");
  });

  it("detects qa/test", () => {
    expect(detectThemePreset("vcptcore-qa.govirto.com")).toBe("test");
    expect(detectThemePreset("test.govirto.com")).toBe("test");
  });

  it("detects staging/uat", () => {
    expect(detectThemePreset("app-staging.govirto.com")).toBe("staging");
    expect(detectThemePreset("app-uat.govirto.com")).toBe("staging");
  });

  it("detects demo", () => {
    expect(detectThemePreset("demo.govirto.com")).toBe("demo");
  });

  it("returns default when no marker is present", () => {
    expect(detectThemePreset("admin.acme.com")).toBe("default");
  });

  it("prioritizes prod over other markers", () => {
    expect(detectThemePreset("prod-qa.govirto.com")).toBe("prod");
  });
});

describe("resolveEnvironment", () => {
  it("maps qa host to QA label, warning color, visible", () => {
    const env = resolveEnvironment("vcptcore-qa.govirto.com");
    expect(env.environmentName).toBe("QA");
    expect(env.color).toBe("warning");
    expect(env.isIgnored).toBe(false);
  });

  it("maps dev host to Development label, success color", () => {
    const env = resolveEnvironment("vcmp-dev.govirto.com");
    expect(env.environmentName).toBe("Development");
    expect(env.color).toBe("success");
    expect(env.isIgnored).toBe(false);
  });

  it("maps demo host to Demo label, info color", () => {
    const env = resolveEnvironment("demo.govirto.com");
    expect(env.environmentName).toBe("Demo");
    expect(env.color).toBe("info");
  });

  it("maps uat host to UAT label, secondary color", () => {
    const env = resolveEnvironment("app-uat.govirto.com");
    expect(env.environmentName).toBe("UAT");
    expect(env.color).toBe("secondary");
  });

  it("hides the banner on production", () => {
    const env = resolveEnvironment("vcmp-prod.govirto.com");
    expect(env.isIgnored).toBe(true);
  });

  it("shows the fallback host label with neutral color for unknown environments", () => {
    const env = resolveEnvironment("admin.acme.com", "admin.acme.com");
    expect(env.environmentName).toBe("admin.acme.com");
    expect(env.color).toBe("neutral");
    expect(env.isIgnored).toBe(false);
  });

  it("ignores an unknown environment when no fallback host is given", () => {
    const env = resolveEnvironment("admin.acme.com");
    expect(env.environmentName).toBe("");
    expect(env.isIgnored).toBe(true);
  });
});
