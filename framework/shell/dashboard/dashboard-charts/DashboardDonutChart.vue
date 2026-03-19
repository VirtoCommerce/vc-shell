<template>
  <ChartContainer :config="config">
    <VisSingleContainer
      :data="data"
      :height="height"
    >
      <VisDonut
        :value="valueAccessor"
        :color="colorAccessor"
        :arc-width="arcWidth"
        :corner-radius="cornerRadius"
        :pad-angle="0.02"
        :central-label="centralLabel"
        :central-sub-label="centralSubLabel"
      />
      <VisTooltip
        v-if="showTooltip"
        :allow-hover="true"
        class-name="dashboard-chart-tooltip-host"
        :vertical-shift="8"
        :triggers="donutTooltipTriggers"
      />
    </VisSingleContainer>
    <ChartLegend
      v-if="showLegend"
      :config="config"
    />
  </ChartContainer>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import {
  VisSingleContainer,
  VisDonut,
  VisTooltip,
  VisDonutSelectors,
} from "@unovis/vue";
import ChartContainer from "./ChartContainer.vue";
import ChartLegend from "./ChartLegend.vue";
import type { ChartConfig } from "./types";
import {
  buildChartTooltipHtml,
  formatNumericValue,
  resolveSeriesMeta,
} from "./chart-utils";

interface DonutSegmentDatum {
  data: T;
  index: number;
  value: number;
}

const props = withDefaults(defineProps<{
  data: T[];
  config: ChartConfig;
  valueKey: keyof T;
  colorKey?: keyof T;
  height?: number;
  arcWidth?: number;
  cornerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  centralLabel?: string;
  centralSubLabel?: string;
  valueFormat?: (value: number) => string;
}>(), {
  colorKey: undefined,
  height: undefined,
  arcWidth: 60,
  cornerRadius: 4,
  showTooltip: true,
  showLegend: true,
  centralLabel: undefined,
  centralSubLabel: undefined,
  valueFormat: undefined,
});

const valueAccessor = (d: T) => d[props.valueKey] as number;
const configKeys = computed(() => Object.keys(props.config));

const colorAccessor = (d: T, index: number) => {
  if (props.colorKey && d[props.colorKey]) {
    return d[props.colorKey] as string;
  }
  return configKeys.value[index]
    ? props.config[configKeys.value[index]].color
    : undefined;
};

const getSegmentLabel = (datum: T, index: number): string => {
  const datumLabel = (datum as Record<string, unknown>).label;
  if (typeof datumLabel === "string" && datumLabel.trim()) {
    return datumLabel;
  }

  const configKey = configKeys.value[index];
  if (configKey) {
    return props.config[configKey]?.label ?? configKey;
  }

  return `Segment ${index + 1}`;
};

const donutTooltipTriggers = computed(() => ({
  [VisDonutSelectors.segment]: (
    segmentDatum: DonutSegmentDatum,
  ): string | undefined => {
    if (!segmentDatum?.data) {
      return undefined;
    }

    const index = segmentDatum.index ?? 0;
    const label = getSegmentLabel(segmentDatum.data, index);
    const configKey = configKeys.value[index];
    const { color } = resolveSeriesMeta({
      config: props.config,
      key: configKey,
      index,
      fallbackLabel: label,
    });

    return buildChartTooltipHtml({
      items: [
        {
          label,
          color: colorAccessor(segmentDatum.data, index) ?? color,
          value: formatNumericValue(
            segmentDatum.value ?? segmentDatum.data[props.valueKey],
            props.valueFormat,
          ),
        },
      ],
    });
  },
}));
</script>
