<template>
  <ChartContainer :config="config">
    <VisXYContainer
      :data="filteredData"
      :height="height"
      :margin="margin"
    >
      <VisTooltip
        v-if="showTooltip"
        :allow-hover="true"
        class-name="dashboard-chart-tooltip-host"
        :vertical-shift="8"
      />
      <VisCrosshair
        v-if="showTooltip"
        :x="xAccessor"
        :y="yAccessors"
        :color="colors"
        :template="crosshairTooltipTemplate"
      />
      <VisLine
        v-for="(accessor, index) in yAccessors"
        :key="index"
        :x="xAccessor"
        :y="accessor"
        :color="colors[index]"
        curve-type="monotoneX"
        :line-width="2"
      />
      <VisAxis
        v-if="showXAxis"
        type="x"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
        :num-ticks="numXTicks"
        :tick-format="xTickFormat"
      />
      <VisAxis
        v-if="showYAxis"
        type="y"
        :tick-line="false"
        :domain-line="false"
        :grid-line="showGrid"
        :num-ticks="numYTicks"
        :tick-format="yTickFormat"
      />
    </VisXYContainer>
    <ChartLegend
      v-if="showLegend"
      :config="config"
    />
  </ChartContainer>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair } from "@unovis/vue";
import ChartContainer from "./ChartContainer.vue";
import ChartLegend from "./ChartLegend.vue";
import type { ChartConfig } from "./types";
import type { ChartRangeValue } from "./chart-utils";
import {
  buildChartTooltipHtml,
  filterDataByRange,
  formatAxisValue,
  formatNumericValue,
  resolveSeriesMeta,
} from "./chart-utils";

export interface Props<T> {
  data: T[];
  config: ChartConfig;
  xKey: keyof T;
  yKeys: (keyof T)[];
  height?: number;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  numXTicks?: number;
  numYTicks?: number;
  rangeStart?: ChartRangeValue;
  rangeEnd?: ChartRangeValue;
  xTickFormat?: (value: number | Date) => string;
  yTickFormat?: (value: number) => string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  height: undefined,
  showTooltip: true,
  showXAxis: true,
  showYAxis: true,
  showGrid: true,
  showLegend: true,
  numXTicks: undefined,
  numYTicks: 5,
  rangeStart: undefined,
  rangeEnd: undefined,
  xTickFormat: undefined,
  yTickFormat: undefined,
});

const margin = { top: 8, right: 8, bottom: 4, left: 4 };

const xAccessor = (d: T) => d[props.xKey] as number;

const filteredData = computed(() =>
  filterDataByRange(
    props.data,
    (datum) => datum[props.xKey],
    props.rangeStart,
    props.rangeEnd,
  ),
);

const yAccessors = computed(() =>
  props.yKeys.map((key) => (d: T) => d[key] as number),
);

const colors = computed(() =>
  props.yKeys.map((key, index) =>
    resolveSeriesMeta({
      config: props.config,
      key: String(key),
      index,
      fallbackLabel: String(key),
    }).color,
  ),
);

const buildTooltipMarkup = (datum: T): string | undefined =>
  buildChartTooltipHtml({
    title: formatAxisValue(datum[props.xKey], props.xTickFormat),
    items: props.yKeys.map((key, index) => {
      const { label, color } = resolveSeriesMeta({
        config: props.config,
        key: String(key),
        index,
        fallbackLabel: String(key),
      });

      return {
        label,
        color,
        value: formatNumericValue(datum[key], props.yTickFormat),
      };
    }),
  });

const crosshairTooltipTemplate = (
  datum: T | undefined,
  _xValue: number | Date,
  allData: T[],
  leftNearestDatumIndex?: number,
): string | undefined => {
  const activeDatum =
    datum ??
    (typeof leftNearestDatumIndex === "number"
      ? allData[leftNearestDatumIndex]
      : undefined);

  if (!activeDatum) {
    return undefined;
  }

  return buildTooltipMarkup(activeDatum);
};
</script>
