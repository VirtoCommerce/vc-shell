import { describe, it, expect, vi, afterEach } from "vitest";
import { getFrameworkBuildInfo, logFrameworkBuildInfo } from "./buildInfo";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getFrameworkBuildInfo", () => {
  it("falls back to 'dev' when Vite build constants are not defined", () => {
    // Vitest does not apply the framework's Vite `define`, so the __VC_SHELL_*
    // constants are genuinely undefined at runtime here — this exercises the
    // dev-mode fallback path.
    const info = getFrameworkBuildInfo();
    expect(info).toEqual({ version: "dev", buildDate: "dev", gitHash: "dev" });
  });
});

describe("logFrameworkBuildInfo", () => {
  it("logs exactly one line containing version, build date and git hash", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logFrameworkBuildInfo({
      version: "2.0.7",
      buildDate: "2026-06-09T10:00:00.000Z",
      gitHash: "a1b2c3d",
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]).toHaveLength(3);
    const formatString = spy.mock.calls[0][0] as string;
    expect(formatString).toContain("@vc-shell/framework");
    expect(formatString).toContain("2.0.7");
    expect(formatString).toContain("2026-06-09T10:00:00.000Z");
    expect(formatString).toContain("a1b2c3d");
  });
});
