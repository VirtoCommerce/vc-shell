import { ComputedRef } from "vue";
import { IBladeElement, ExtendedComponent } from "./../../shared";

// Type instead of interface here is workaround for:
// https://github.com/microsoft/TypeScript/issues/15300
// (index signature is missing for interfaces in Typescript,
// i.e. interface N { key: value } can't be casted to Record<TKey,TValue>
// while it satisfies requirements
export type IValidationRules = {
  required?: boolean;
  numberic?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
  min_value?: number;
  max_value: number;
  after?: string;
  maxdimensions?: [string | number, string | number];
  size?: number;
};

export interface IBladeToolbar {
  id?: string;
  icon?: string | (() => string);
  title?: string | unknown;
  isVisible?: boolean | unknown;
  isAccent?: boolean | ComputedRef<boolean>;
  component?: ExtendedComponent;
  bladeOptions?: Record<string, unknown>;
  disabled?: boolean | ComputedRef<boolean>;
  dropdownItems?: IBladeDropdownItem[];
  clickHandler?(app?: Record<string, unknown> | IBladeElement): void;
}

export interface IBladeDropdownItem {
  id: string;
  title: string;
  icon?: string;
  clickHandler?(): void;
}

export interface IMenuItems extends IBladeToolbar {
  children?: IBladeToolbar[];
}

export interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  leftActions?: boolean;
  clickHandler(item?: { id?: string }): void;
}

export interface IImage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  sortOrder?: number;
  title?: string | undefined;
  name?: string | undefined;
  url?: string | undefined;
}

export interface Asset {
  readableSize?: string;
  relativeUrl?: string;
  url?: string;
  description?: string;
  name?: string;
  modifiedDate?: Date;
  id?: string;
  altText?: string;
  typeId?: string;
  sortOrder?: number;
  size?: number;
  createdDate?: Date;
}

export interface AuthData {
  accessToken?: string;
  //alias for accessToken is used by platform and is required for sharing auth data between platform and custom apps
  token?: string;
  refreshToken?: string;
  userName?: string;
  expiresAt?: number;
}

export interface SignInResults {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

export interface RequestPasswordResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

export type ITableColumns = {
  id: string;
  title: string | ComputedRef<string>;
  width?: number | string;
  field?: string;
  alwaysVisible?: boolean;
  type?: "money" | "date-ago" | "date" | "time" | "date-time" | "image" | "status" | "status-icon" | "number" | "link";
  sortable?: boolean;
  class?: string;
  format?: string;
  align?: "start" | "end" | "center" | "between" | "around" | "evenly";
  visible?: boolean;
};
