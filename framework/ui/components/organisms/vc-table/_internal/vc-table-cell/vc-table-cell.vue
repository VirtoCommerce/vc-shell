<template>
  <div>
    <!-- Money cell -->
    <template v-if="cell.type === 'money'">
      <div
        v-if="typeof Number(value) === 'number'"
        class="tw-truncate"
        :class="cell.class"
      >
        <template v-if="cellEditActive">
          <VcInputCurrency
            :model-value="value"
            :options="[]"
            :option="(item[cell.currencyField || 'currency'] as string) || 'USD'"
            currency-display="symbol"
            class="tw-w-full"
            @update:model-value="$emit('update', { field: cell.id, value: $event })"
          />
        </template>
        <template v-else>
          <span class="tw-truncate">{{ intlMoney(Number(value)) }}</span>
        </template>
      </div>
      <template v-else-if="!cellEditActive">
        <div
          class="tw-truncate"
          :class="cell.class"
        >
          N/A
        </div>
      </template>
    </template>

    <!-- Date ago cell -->
    <span
      v-else-if="cell.type === 'date-ago'"
      class="tw-text-[#a5a5a5]"
      :class="cell.class"
      :title="(value instanceof Date && value.toLocaleString(locale)) || ''"
    >
      <div
        v-if="value"
        class="tw-truncate"
      >
        {{ moment(value).fromNow() }}
      </div>
      <div
        v-else
        class="tw-truncate"
      >
        N/A
      </div>
    </span>

    <!-- Date exact cell -->
    <div
      v-else-if="cell.type === 'date' || cell.type === 'time' || cell.type === 'date-time'"
      class="tw-text-[#a5a5a5] tw-truncate"
      :class="cell.class"
    >
      <template v-if="value">
        <div
          v-if="cell.format"
          class="tw-truncate"
        >
          {{ moment(value).locale(locale).format(cell.format) }}
        </div>
        <template v-else>
          <div
            v-if="cell.type === 'date'"
            class="tw-truncate"
          >
            {{ value instanceof Date && value.toLocaleDateString(locale) }}
          </div>
          <div
            v-if="cell.type === 'time'"
            class="tw-truncate"
          >
            {{ value instanceof Date && value.toLocaleTimeString(locale) }}
          </div>
          <p
            v-if="cell.type === 'date-time'"
            class="tw-truncate"
          >
            {{ value instanceof Date && value.toLocaleString(locale) }}
          </p>
        </template>
      </template>
      <div
        v-else
        class="tw-truncate"
      >
        N/A
      </div>
    </div>

    <!-- Image cell -->
    <template v-else-if="cell.type === 'image'">
      <VcImage
        :bordered="true"
        size="s"
        aspect="1x1"
        :src="value as string"
        background="contain"
      />
    </template>

    <!-- Status cell -->
    <template v-else-if="cell.type === 'status'">
      <VcStatus>{{ value }}</VcStatus>
    </template>

    <!-- Status icon cell -->
    <div
      v-else-if="cell.type === 'status-icon'"
      class="tw-flex tw-justify-center"
      :class="cell.class"
    >
      <VcStatusIcon :status="value as boolean"></VcStatusIcon>
    </div>

    <!-- Number cell -->
    <div
      v-else-if="cell.type === 'number'"
      class="tw-text-right tw-truncate"
      :class="cell.class"
    >
      <template v-if="cellEditActive">
        <VcInput
          :model-value="value"
          class="tw-w-full"
          type="number"
          @update:model-value="$emit('update', { field: cell.id, value: $event })"
        ></VcInput>
      </template>
      <template v-else>
        {{ typeof Number(value) === "number" && Number(value) >= 0 ? Number(value).toFixed(0) : "N/A" }}
      </template>
    </div>

    <!-- Link cell -->
    <template v-else-if="cell.type === 'link'">
      <VcLink
        class="tw-truncate"
        :class="cell.class"
        >{{ value }}</VcLink
      >
    </template>

    <!-- HTML cell -->
    <template v-else-if="cell.type === 'html'">
      <div
        class="tw-p-1"
        :class="cell.class"
        v-html="truncatedHtml"
      />
    </template>

    <!-- Default cell -->
    <div
      v-else
      class="tw-truncate"
      :class="cell.class"
    >
      <template v-if="cellEditActive">
        <VcInput
          :model-value="value"
          class="tw-w-full"
          @update:model-value="$emit('update', { field: cell.id, value: $event })"
        ></VcInput>
      </template>
      <template v-else>
        {{ value }}
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";
import { ITableColumns } from "./../../../../../../core/types";
import * as _ from "lodash-es";
import htmlTruncate from "truncate-html";
import * as DOMPurify from "dompurify";
import VcInputCurrency from "../../../../molecules/vc-input-currency/vc-input-currency.vue";
import VcInput from "../../../../molecules/vc-input/vc-input.vue";

export interface Props {
  cell: ITableColumns;
  item: Record<string, unknown>;
  width?: number;
  cellEditActive?: boolean;
}

const props = defineProps<Props>();
defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (event: "update", payload: { field: string; value: any }): void;
}>();

const locale = window.navigator.language;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = computed((): any => _.get(props.item, props.cell.field || props.cell.id));

const sanitizedHtml = computed(() => {
  if (props.cell.type === "html") {
    return DOMPurify.default.sanitize(value.value as string, { USE_PROFILES: { html: true } });
  }
  return "";
});

const truncatedHtml = computed(() =>
  htmlTruncate(sanitizedHtml.value, +(typeof props.width !== "undefined" ? Math.floor(props.width / 5) : 30)),
);

function intlMoney(value: number) {
  if (props.cell.type !== "money") {
    return value;
  }
  const currencyProp = props.cell.currencyField || "currency";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: (props.item[currencyProp] as string) || "USD",
  }).format(value);
}
</script>
