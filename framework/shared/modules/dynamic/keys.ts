import type { InjectionKey, Ref } from "vue";

export const IsBladeEditableKey: InjectionKey<boolean | Ref<boolean>> = Symbol("IsBladeEditable");
