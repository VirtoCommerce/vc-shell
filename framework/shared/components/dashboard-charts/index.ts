import { defineAsyncComponent } from "vue";

export { default as ChartContainer } from "./ChartContainer.vue";
export { default as ChartTooltip } from "./ChartTooltip.vue";
export { default as ChartLegend } from "./ChartLegend.vue";
export type { ChartConfig, ChartConfigItem } from "./types";

type DashboardLineChartComponent = typeof import("./DashboardLineChart.vue")["default"];
type DashboardBarChartComponent = typeof import("./DashboardBarChart.vue")["default"];
type DashboardDonutChartComponent = typeof import("./DashboardDonutChart.vue")["default"];

export const DashboardLineChart = defineAsyncComponent({
  loader: () => import("./DashboardLineChart.vue"),
  delay: 200,
  timeout: 10000,
  suspensible: false,
}) as DashboardLineChartComponent;

export const DashboardBarChart = defineAsyncComponent({
  loader: () => import("./DashboardBarChart.vue"),
  delay: 200,
  timeout: 10000,
  suspensible: false,
}) as DashboardBarChartComponent;

export const DashboardDonutChart = defineAsyncComponent({
  loader: () => import("./DashboardDonutChart.vue"),
  delay: 200,
  timeout: 10000,
  suspensible: false,
}) as DashboardDonutChartComponent;
