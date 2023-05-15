/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_PLATFORM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
