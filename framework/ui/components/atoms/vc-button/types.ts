import type { InjectionKey } from "vue";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "outline"
  | "ghost"
  | "link";

export type ButtonSize =
  | "sm"
  | "default"
  | "lg"
  | "icon"
  // Legacy aliases (backward compat)
  | "xs"
  | "base";

export interface ButtonGroupContext {
  size?: { value: ButtonSize | undefined };
  attached?: { value: boolean };
}

export const ButtonGroupKey: InjectionKey<ButtonGroupContext> = Symbol("vc-button-group");
