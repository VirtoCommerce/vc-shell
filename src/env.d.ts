/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly APP_PLATFORM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
