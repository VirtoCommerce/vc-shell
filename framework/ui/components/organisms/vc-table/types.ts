/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, ComputedRef, UnwrapRef } from "vue";
import { IActionBuilderResult } from "../../../../core/types";
import type { ITableColumns as ITableColumnsBase } from "../../../../core/types";

export interface StatusImage {
  image?: string;
  text: string | Ref<string>;
  action?: string;
  clickHandler?: () => void;
}

export interface TableItem {
  [x: string]: any;
  id?: string;
  actions?: IActionBuilderResult[];
}

export type ITableColumns = ITableColumnsBase;

export type TableColPartial = Partial<
  ITableColumns & {
    predefined?: boolean;
  }
>;
