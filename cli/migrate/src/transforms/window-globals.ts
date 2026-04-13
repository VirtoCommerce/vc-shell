import type { FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const WINDOW_GLOBALS: Record<string, string> = {
  "window.Vue": "Use `import { createApp } from 'vue'` instead",
  "window.VueRouter": "Use `import { createRouter } from 'vue-router'` instead",
  "window.moment": "Use `import { formatDateWithPattern } from '@vc-shell/framework'` — see guide 03",
  "window._": "Use `import { uniq, debounce, ... } from 'lodash-es'` instead",
  "window.VcShellFramework": "Use named imports from '@vc-shell/framework' instead",
  "window.VeeValidate": "Use `import { useForm, Field } from 'vee-validate'` instead",
  "window.VueUse": "Use `import { ... } from '@vueuse/core'` instead",
  "window.VueI18n": "Use `import { useI18n } from 'vue-i18n'` instead",
};

const transform: Transform = (fileInfo: FileInfo, api: any, _options: Options): string | null => {
  const source = fileInfo.source;

  for (const [global, advice] of Object.entries(WINDOW_GLOBALS)) {
    const escaped = global.replace(".", "\\.");
    const re = new RegExp(`\\b${escaped}\\b`);
    if (re.test(source)) {
      api.report(`${fileInfo.path}: ${global} is removed in v2. ${advice}`);
    }
  }

  return null;
};

export default transform;
export const parser = "tsx";
