import { useI18n as VueUseI18n } from "vue-i18n";

/** @deprecated use `useI18n({ useScope: "global" })` directly from `vue-i18n` */
export default function useI18n() {
  console.debug(`[@vc-shell/framework#useI18n] - Entry point`);
  return VueUseI18n({ useScope: "global" });
}
