export interface ChartConfigItem {
  label: string;
  color: string;
  icon?: string;
}

export type ChartConfig = Record<string, ChartConfigItem>;
