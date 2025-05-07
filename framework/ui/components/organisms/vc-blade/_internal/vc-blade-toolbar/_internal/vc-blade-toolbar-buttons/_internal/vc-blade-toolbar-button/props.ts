import { Ref, ComputedRef } from "vue";

export interface Props {
  id?: string;
  icon?: string | (() => string);
  disabled?: boolean | ComputedRef<boolean | undefined>;
  title?: string | Ref<string> | ComputedRef<string>;
  size?: "s" | "m";
  separator?: "left" | "right" | "both";
  contentDirection?: "row" | "row-reverse" | "column";
  iconClassName?: string;
  titleClassName?: string;
  onClick?: () => Promise<void> | void;
}
