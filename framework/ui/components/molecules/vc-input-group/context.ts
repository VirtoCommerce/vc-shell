import type { InjectionKey, Ref } from "vue";

export interface InputGroupContext {
  name: Ref<string | undefined>;
  disabled: Ref<boolean>;
  invalid: Ref<boolean>;
  describedBy: Ref<string | undefined>;
}

export const InputGroupContextKey: InjectionKey<InputGroupContext> = Symbol("vc-input-group-context");
