import { MaybeRef } from "vue";

export interface Breadcrumbs {
  icon?: string;
  title: MaybeRef<string | undefined>;
  clickHandler?: (id: string) => void | boolean | Promise<void | boolean>;
  id: string;
}
