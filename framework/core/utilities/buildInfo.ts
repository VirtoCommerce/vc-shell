import { version as frameworkVersion } from "../../package.json";

/**
 * `version` comes statically from the framework's `package.json`, so it is accurate
 * both in a built framework and when consumed from source.
 *
 * `buildDate` and `gitHash` are injected by Vite `define` in
 * `framework/vite.config.mts` during `vite build`. In source contexts the define is
 * absent and `typeof <undeclared>` yields `"undefined"`, so both fall back to "dev".
 */
export interface IFrameworkBuildInfo {
  version: string;
  buildDate: string;
  gitHash: string;
}

export function getFrameworkBuildInfo(): IFrameworkBuildInfo {
  return {
    version: frameworkVersion,
    buildDate: typeof __VC_SHELL_BUILD_DATE__ !== "undefined" ? __VC_SHELL_BUILD_DATE__ : "dev",
    gitHash: typeof __VC_SHELL_GIT_HASH__ !== "undefined" ? __VC_SHELL_GIT_HASH__ : "dev",
  };
}

export function logFrameworkBuildInfo(info: IFrameworkBuildInfo = getFrameworkBuildInfo()): void {
  // console.warn, not the logger util: the %c CSS styling isn't supported by the
  // abstraction, and app production builds mark console.log/info/debug as `pure` in
  // esbuild (see vite.application.appconfig.ts), which would strip this banner.
  console.warn(
    `%c@vc-shell/framework%c v${info.version} · ${info.buildDate} · ${info.gitHash}`,
    "font-weight:bold;color:#319ED4",
    "color:inherit",
  );
}
