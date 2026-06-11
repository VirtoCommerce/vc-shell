import { version as frameworkVersion } from "../../package.json";

/**
 * `version` is read statically from the framework's `package.json`, so it is
 * always accurate — both in a built/published framework AND when the framework
 * is consumed from source (Storybook, dev server, Vitest).
 *
 * `buildDate` and `gitHash` are injected by Vite `define` in
 * `framework/vite.config.mts` during `vite build` of the framework. In source
 * contexts the `define` is not applied; `typeof <undeclared>` returns
 * `"undefined"` without throwing a ReferenceError, so they fall back to "dev".
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
  // Direct console.log (not the logger util): the %c CSS styling is not supported
  // by the logger abstraction, and this banner must always print for debugging.
  console.log(
    `%c@vc-shell/framework%c v${info.version} · ${info.buildDate} · ${info.gitHash}`,
    "font-weight:bold;color:#319ED4",
    "color:inherit",
  );
}
