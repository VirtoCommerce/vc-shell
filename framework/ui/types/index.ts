export type { IFormFieldProps, ITextFieldProps } from "./form-field";

// GlobalComponents augmentation moved to ./global-components.ts
// to break circular dependency (ui/types → ui/components → ... → ui/types)

// Canonical location: @core/types/breadcrumbs
export type { Breadcrumbs } from "@core/types/breadcrumbs";
