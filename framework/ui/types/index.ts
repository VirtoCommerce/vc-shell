import { MaybeRef } from "vue";

export type { IFormFieldProps, ITextFieldProps } from "./form-field";

// GlobalComponents augmentation moved to ./global-components.ts
// to break circular dependency (ui/types → ui/components → ... → ui/types)

export interface Breadcrumbs {
  icon?: string;
  title: MaybeRef<string | undefined>;
  clickHandler?: (id: string) => void | boolean | Promise<void | boolean>;
  id: string;
}
