/**
 * Build-time constants injected by Vite `define` (framework/vite.config.mts). Declared
 * under typings/, which tsconfig includes but package.json "files" does not, so they
 * type-check during the framework build without leaking into consuming apps.
 */
declare const __VC_SHELL_BUILD_DATE__: string;
declare const __VC_SHELL_GIT_HASH__: string;
