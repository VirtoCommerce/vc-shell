<template>
  <div class="vc-table-cell">
    <!-- Money Cell -->
    <template v-if="cell.type === 'money'">
      <template v-if="!isEditable && (typeof value === 'undefined' || Number(value) === 0)">
        <div class="vc-table-cell__not-set">
          {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
        </div>
      </template>
      <div
        v-else-if="typeof Number(value) === 'number'"
        :class="['vc-table-cell__money', cell.class]"
      >
        <template v-if="isEditable">
          <Field
            v-slot="{ errors, errorMessage }"
            :label="cell.title as string"
            :name="`${cell.id}_${index}`"
            :model-value="value"
            :rules="cell.rules"
          >
            <VcTooltip placement="bottom">
              <template #default>
                <VcInputCurrency
                  :model-value="value"
                  :options="[]"
                  :option="(item as TableItem)[cell.currencyField || 'currency'] || 'USD'"
                  currency-display="symbol"
                  class="vc-table-cell__input-currency"
                  :error="errors.length > 0"
                  :error-message="$isMobile.value ? errorMessage : undefined"
                  @update:model-value="$emit('update', { field: cell.id, value: $event })"
                  @blur="onBlur({ row: index, field: cell.id, errors })"
                >
                  <template
                    v-if="$isDesktop.value && errors.length > 0"
                    #append-inner
                  >
                    <VcIcon
                      icon="material-error"
                      class="vc-table-cell__error-icon"
                    ></VcIcon>
                  </template>
                </VcInputCurrency>
              </template>
              <template
                v-if="errorMessage"
                #tooltip
              >
                <div class="vc-table-cell__error-tooltip">
                  {{ errorMessage }}
                </div>
              </template>
            </VcTooltip>
          </Field>
        </template>
        <template v-else>
          <span class="vc-table-cell__money-display">{{ intlMoney(Number(value)) }}</span>
        </template>
      </div>
    </template>

    <!-- Date Ago Cell -->
    <span
      v-else-if="cell.type === 'date-ago'"
      :class="['vc-table-cell__date-ago', cell.class]"
      :title="(value instanceof Date && value.toLocaleString(locale)) || ''"
    >
      <div
        v-if="value"
        class="vc-table-cell__date-ago-content"
      >
        {{ moment(value).fromNow() }}
      </div>
      <div
        v-else
        class="vc-table-cell__not-set"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
      </div>
    </span>

    <!-- Exact Date/Time Cell -->
    <div
      v-else-if="cell.type === 'date' || cell.type === 'time' || cell.type === 'date-time'"
      :class="['vc-table-cell__date', cell.class]"
    >
      <template v-if="value">
        <div
          v-if="cell.format"
          class="vc-table-cell__date-content"
        >
          {{ moment(value).locale(locale).format(cell.format) }}
        </div>
        <template v-else>
          <div
            v-if="cell.type === 'date'"
            class="vc-table-cell__date-content"
          >
            {{ value instanceof Date && value.toLocaleDateString(locale) }}
          </div>
          <div
            v-if="cell.type === 'time'"
            class="vc-table-cell__date-content"
          >
            {{ value instanceof Date && value.toLocaleTimeString(locale) }}
          </div>
          <p
            v-if="cell.type === 'date-time'"
            class="vc-table-cell__date-content"
          >
            {{ value instanceof Date && value.toLocaleString(locale) }}
          </p>
        </template>
      </template>
      <div
        v-else
        class="vc-table-cell__not-set"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
      </div>
    </div>

    <!-- Image Cell -->
    <template v-else-if="cell.type === 'image'">
      <VcImage
        class="vc-table-cell__image"
        :bordered="true"
        size="s"
        aspect="1x1"
        :src="value as string"
        :empty-icon="('emptyIcon' in cell && cell.emptyIcon) || undefined"
        background="contain"
      />
    </template>

    <!-- Status Cell -->
    <template v-else-if="cell.type === 'status'">
      <VcStatus class="vc-table-cell__status">{{ value }}</VcStatus>
    </template>

    <!-- Status Icon Cell -->
    <div
      v-else-if="cell.type === 'status-icon'"
      class="vc-table-cell__status-icon"
      :class="cell.class"
    >
      <VcStatusIcon
        v-if="typeof value === 'boolean'"
        :status="value as boolean"
      ></VcStatusIcon>
    </div>

    <!-- Number Cell -->
    <div
      v-else-if="cell.type === 'number'"
      :class="['vc-table-cell__number', cell.class]"
    >
      <template v-if="isEditable">
        <Field
          v-slot="{ errors, errorMessage }"
          :label="cell.title as string"
          :name="`${cell.id}_${index}`"
          :model-value="value"
          :rules="cell.rules"
        >
          <VcTooltip placement="bottom">
            <template #default>
              <VcInput
                :model-value="value"
                class="vc-table-cell__input-number"
                type="number"
                :error="errors.length > 0"
                :error-message="$isMobile.value ? errorMessage : undefined"
                @update:model-value="$emit('update', { field: cell.id, value: $event })"
                @blur="onBlur({ row: index, field: cell.id, errors })"
              >
                <template
                  v-if="$isDesktop.value && errors.length > 0"
                  #append-inner
                >
                  <VcIcon
                    icon="material-error"
                    class="vc-table-cell__error-icon"
                  ></VcIcon>
                </template>
              </VcInput>
            </template>
            <template
              v-if="errorMessage"
              #tooltip
            >
              <div class="vc-table-cell__error-tooltip">
                {{ errorMessage }}
              </div>
            </template>
          </VcTooltip>
        </Field>
      </template>
      <template v-else>
        {{
          typeof Number(value) === "number" && Number(value) >= 0
            ? Number(value).toFixed(0)
            : $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET")
        }}
      </template>
    </div>

    <!-- Link Cell -->
    <template v-else-if="cell.type === 'link'">
      <VcLink
        class="vc-table-cell__link"
        :class="cell.class"
        >{{ value }}</VcLink
      >
    </template>

    <!-- HTML Cell -->
    <template v-else-if="cell.type === 'html'">
      <div
        class="vc-table-cell__html"
        :class="cell.class"
        v-html="truncatedHtml"
      />
    </template>

    <!-- Default Cell -->
    <div
      v-else
      :class="['vc-table-cell__default', cell.class]"
    >
      <template v-if="isEditable">
        <Field
          v-slot="{ errors, errorMessage }"
          :label="cell.title as string"
          :name="`${cell.id}_${index}`"
          :model-value="value"
          :rules="cell.rules"
        >
          <VcTooltip placement="bottom">
            <template #default>
              <VcInput
                :model-value="value"
                class="vc-table-cell__input-default"
                :error="errors.length > 0"
                :error-message="$isMobile.value ? errorMessage : undefined"
                @update:model-value="$emit('update', { field: cell.id, value: $event })"
                @blur="onBlur({ row: index, field: cell.id, errors })"
              >
                <template
                  v-if="$isDesktop.value && errors.length > 0"
                  #append-inner
                >
                  <VcIcon
                    icon="material-error"
                    class="vc-table-cell__error-icon"
                  ></VcIcon>
                </template>
              </VcInput>
            </template>
            <template
              v-if="errorMessage"
              #tooltip
            >
              <div class="vc-table-cell__error-tooltip">
                {{ errorMessage }}
              </div>
            </template>
          </VcTooltip>
        </Field>
      </template>
      <template v-else>
        {{ value }}
      </template>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";
import * as _ from "lodash-es";
import htmlTruncate from "truncate-html";
import * as DOMPurify from "dompurify";
import VcInputCurrency from "@ui/components/molecules/vc-input-currency/vc-input-currency.vue";
import VcInput from "@ui/components/molecules/vc-input/vc-input.vue";
import VcTooltip from "@ui/components/atoms/vc-tooltip/vc-tooltip.vue";
import { Field } from "vee-validate";
import type { TableItem } from "@ui/components/organisms/vc-table/types";
import { ITableColumns } from "@core/types";

// Cache for sanitized HTML to avoid repeated DOMPurify calls across table cells
const sanitizedHtmlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 500;

function getSanitizedHtml(html: string): string {
  if (sanitizedHtmlCache.has(html)) {
    return sanitizedHtmlCache.get(html)!;
  }

  const sanitized = DOMPurify.default.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "table",
      "thead", "tbody", "tr", "th", "td", "hr", "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "colspan", "rowspan", "align", "valign"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
  });

  // Limit cache size to prevent memory leaks
  if (sanitizedHtmlCache.size >= MAX_CACHE_SIZE) {
    const firstKey = sanitizedHtmlCache.keys().next().value;
    if (firstKey !== undefined) {
      sanitizedHtmlCache.delete(firstKey);
    }
  }

  sanitizedHtmlCache.set(html, sanitized);
  return sanitized;
}

export interface Props {
  cell: ITableColumns;
  item: string | TableItem;
  width?: number;
  editing?: boolean;
  index?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "update", payload: { field: string; value: any }): void;
  (event: "blur", payload: { row: number | undefined; field: string }): void;
}>();

const locale = window.navigator.language;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = computed((): any => _.get(props.item, props.cell.field || props.cell.id));

const isEditable = computed(() => props.cell.editable && props.editing);

const sanitizedHtml = computed(() => {
  if (props.cell.type === "html" && value.value) {
    return getSanitizedHtml(String(value.value));
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
    currency: (props.item as TableItem)[currencyProp] || "USD",
  }).format(value);
}

function onBlur(args: { row: number | undefined; field: string; errors?: string[] }) {
  if (args.errors && args.errors.length > 0) {
    return;
  }
  emit("blur", { row: args.row, field: args.field });
}
</script>

<style lang="scss">
:root {
  --table-cell-error-color: var(--danger-500);
  --table-cell-text-color: var(--neutrals-400);
  --table-cell-text-base-color: var(--additional-950);
}

.vc-table-cell {
  @apply tw-text-sm tw-text-[color:var(--table-cell-text-base-color)] tw-leading-normal;

  &__not-set {
    @apply tw-truncate;
  }

  &__money {
    @apply tw-truncate;
  }

  &__input-currency {
    @apply tw-w-full;
  }

  &__error-icon {
    @apply tw-text-[color:var(--table-cell-error-color)];
  }

  &__error-tooltip {
    @apply tw-text-[color:var(--table-cell-error-color)];
  }

  &__date-ago {
    @apply tw-text-[color:var(--table-cell-text-color)];
  }

  &__date-ago-content {
    @apply tw-truncate;
  }

  &__date {
    @apply tw-truncate tw-text-[color:var(--table-cell-text-color)];
  }

  &__date-content {
    @apply tw-truncate;
  }

  &__status-icon {
    @apply tw-flex tw-justify-center;
  }

  &__number {
    @apply tw-truncate;
  }

  &__input-number {
    @apply tw-w-full;
  }

  &__link {
    @apply tw-truncate;
  }

  &__html {
    @apply tw-p-1 tw-truncate;
  }

  &__default {
    @apply tw-truncate;
  }

  &__input-default {
    @apply tw-w-full;
  }
}
</style>
