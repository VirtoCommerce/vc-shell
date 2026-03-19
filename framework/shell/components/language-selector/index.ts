import _LanguageSelector from "@shell/components/language-selector/language-selector.vue";

export const LanguageSelector = _LanguageSelector as typeof _LanguageSelector;

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    LanguageSelector: typeof LanguageSelector;
  }
}
