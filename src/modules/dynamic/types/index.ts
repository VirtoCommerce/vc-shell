export type Composable<T> = T[keyof T];

export interface DynamicData {
  settings: Settings;
  content: DetailsContent[] & ListContent[];
}

export interface Settings {
  url: string;
  titleTemplate: string;
  moduleName: string;
  icon: string;
  composable: any;
  toolbar: {
    id: string;
    title: string;
  }[];
}

export interface ListContent {
  type?: string;
  columns?: {
    id: string;
    title: string;
    type?: string;
    sortable?: boolean;
    alwaysVisible?: boolean;
    field?: string;
  }[];
}

export interface DetailsContent {
  type?: string;
  label?: string;
  property?: string;
  optionProperty?: string;
  actions?: any;
  exclude?: any[];
  include?: any[];
  icon?: string;
  iconSize?: "s" | "xs" | "m" | "l" | "xl" | "xxl";
  trueValue?: boolean;
  falseValue?: boolean;
  text?: boolean;
  method?: string;
  small?: boolean;
  moreInfo?: string;
  variant?: "number" | "url" | "time" | "text" | "password" | "email" | "date" | "tel" | "datetime-local";
  rules?: {
    [x: string]: boolean | string;
    required?: boolean;
  };
  disabled?: boolean | Pick<DetailsContent, "method">;
  optionValue?: string;
  optionLabel?: string;
  navigate?: string;
  children?: DetailsContent[];
  content?: string;
  tooltip?: string;
  name?: string;
  columns?: number;
  fields?: DetailsContent[];
  remove?: { method?: string };
}
