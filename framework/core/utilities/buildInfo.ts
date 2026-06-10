/**
 * Build-time constants injected by Vite `define` in `framework/vite.config.mts`
 * during `vite build` of the framework. They are frozen at framework publish
 * time, so a consuming app reads the framework version it was built against.
 *
 * In dev mode (framework source consumed via alias, Storybook, or Vitest) the
 * `define` is not applied. `typeof <undeclared>` returns `"undefined"` without
 * throwing a ReferenceError, so the guard yields the "dev" fallback.
 */
export interface IFrameworkBuildInfo {
  version: string;
  buildDate: string;
  gitHash: string;
}

export function getFrameworkBuildInfo(): IFrameworkBuildInfo {
  return {
    version: typeof __VC_SHELL_VERSION__ !== "undefined" ? __VC_SHELL_VERSION__ : "dev",
    buildDate: typeof __VC_SHELL_BUILD_DATE__ !== "undefined" ? __VC_SHELL_BUILD_DATE__ : "dev",
    gitHash: typeof __VC_SHELL_GIT_HASH__ !== "undefined" ? __VC_SHELL_GIT_HASH__ : "dev",
  };
}

export function logFrameworkBuildInfo(info: IFrameworkBuildInfo = getFrameworkBuildInfo()): void {
  // Direct console.log (not the logger util): the %c CSS styling is not supported
  // by the logger abstraction, and this banner must always print for debugging.
  console.log(
    `%c@vc-shell/framework%c v${info.version} · ${info.buildDate} · ${info.gitHash}`,
    "font-weight:bold;color:#319ED4",
    "color:inherit",
  );
}
