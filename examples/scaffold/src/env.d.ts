/// <reference types="vite/client" />
/// <reference path="../../../framework/typings/blade-macros.d.ts" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly APP_PLATFORM_URL?: string;
  readonly APP_I18N_LOCALE?: string;
  readonly APP_I18N_FALLBACK_LOCALE?: string;
}
