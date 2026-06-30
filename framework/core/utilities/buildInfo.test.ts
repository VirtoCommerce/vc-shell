import { describe, it, expect, vi, afterEach } from "vitest";
import { version as frameworkVersion } from "../../package.json";
import { getFrameworkBuildInfo, logFrameworkBuildInfo } from "./buildInfo";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getFrameworkBuildInfo", () => {
  it("reads version from package.json and falls back to 'dev' for build-time fields in source mode", () => {
    // Vitest does not apply the framework's Vite `define`, so __VC_SHELL_BUILD_DATE__
    // and __VC_SHELL_GIT_HASH__ are genuinely undefined here — the dev-mode fallback.
    // version, however, is read statically from package.json and is always accurate.
    const info = getFrameworkBuildInfo();
    expect(info.version).toBe(frameworkVersion);
    expect(info.buildDate).toBe("dev");
    expect(info.gitHash).toBe("dev");
  });
});

describe("logFrameworkBuildInfo", () => {
  it("logs exactly one line containing version, build date and git hash", () => {
    // console.warn (not console.log) — app production builds mark console.log/info/debug
    // as `pure` in esbuild and strip them, so the banner uses warn to survive.
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

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
