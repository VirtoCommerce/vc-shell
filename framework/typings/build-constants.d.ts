/**
 * Build-time constants injected by Vite `define` (see framework/vite.config.mts).
 * Declared here (under typings/, which is in tsconfig `include` but NOT in
 * package.json "files") so they type-check during the framework's own build and
 * do NOT leak into apps consuming @vc-shell/framework.
 */
declare const __VC_SHELL_BUILD_DATE__: string;
declare const __VC_SHELL_GIT_HASH__: string;
