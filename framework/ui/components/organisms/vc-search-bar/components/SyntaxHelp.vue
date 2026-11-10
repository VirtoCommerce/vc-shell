<template>
  <div
    class="vc-search-bar__help"
    role="region"
    :aria-label="$t(`${P}.SYNTAX_CARD`)"
  >
    <table>
      <tr
        v-for="h in examples"
        :key="h.ex"
      >
        <td>
          <button
            type="button"
            class="vc-search-bar__token"
            :aria-label="$t(`${P}.INSERT`, { example: h.ex })"
            @click="emit('insert', h.ex)"
          >
            {{ h.ex }}
          </button>
        </td>
        <td>{{ $t(`${P}.${h.what}`) }}</td>
      </tr>
    </table>
    <p>
      {{ $t(`${P}.FIELDS`) }}:
      <template
        v-for="(f, i) in fields"
        :key="f.id"
        >{{ i ? ", " : "" }}{{ f.label }} <code class="vc-search-bar__code">{{ f.key }}</code></template
      >. {{ $t(`${P}.WORDS_NOTE`) }}
    </p>
    <a
      class="vc-search-bar__doclink"
      :href="DOC_URL"
      target="_blank"
      rel="noopener"
      >{{ $t(`${P}.DOC_LINK`) }}</a
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BarField } from "../lib/fields";
import { quote } from "../phrase/parse";
import { resolveRelative } from "../lib/values";

const props = defineProps<{ fields: BarField[] }>();
const emit = defineEmits<{ insert: [example: string] }>();

const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED";
const DOC_URL =
  "https://docs.virtocommerce.org/platform/developer-guide/Fundamentals/Indexed-Search/search-query-syntax-reference/";

const week = resolveRelative({ relative: "7d" }, new Date());

// Examples use the keys of the current fields; one is left out when no field of its kind exists
const examples = computed(() => {
  const list = props.fields;
  const value = (f: BarField, i = 0) => quote(String(f.options[i]?.value ?? "value"));
  const multi = list.find((f) => f.kind === "multiselect");
  const select = list.find((f) => f.kind === "select" || f.kind === "multiselect");
  const number = list.find((f) => f.kind === "number");
  const date = list.find((f) => f.kind === "dateRange");
  const pair = list.filter((f) => f.kind === "select" || f.kind === "multiselect" || f.kind === "text").slice(0, 2);
  const out: { ex: string; what: string }[] = [];
  if (multi)
    out.push({
      ex: `${multi.key}:${value(multi)}${multi.options[1] ? `,${value(multi, 1)}` : ""}`,
      what: "EXAMPLE_ANY",
    });
  if (select) out.push({ ex: `!${select.key}:${value(select)}`, what: "EXAMPLE_NOT" });
  if (number) {
    out.push({ ex: `${number.key}:[100 TO 500]`, what: "EXAMPLE_BETWEEN" });
    out.push({ ex: `${number.key}:[1000 TO]`, what: "EXAMPLE_FROM" });
  }
  if (date) out.push({ ex: `${date.key}:[${week.start} TO ${week.end}]`, what: "EXAMPLE_DATES" });
  out.push({ ex: '"Acme Corp"', what: "EXAMPLE_QUOTES" });
  if (pair.length === 2)
    out.push({ ex: `${pair[0].key}:${value(pair[0])} OR ${pair[1].key}:${value(pair[1])}`, what: "EXAMPLE_OR" });
  return out;
});
</script>

<style lang="scss">
.vc-search-bar {
  &__help {
    @apply tw-p-2 tw-rounded-md tw-text-xs tw-flex tw-flex-col tw-gap-1;
    background: var(--neutrals-50);
    border: 1px solid var(--neutrals-200);
    table {
      border-collapse: collapse;
      width: auto;
    }
    td {
      @apply tw-py-0.5 tw-pe-4 tw-align-top;
      color: var(--neutrals-600);
    }
    td:first-child {
      @apply tw-whitespace-nowrap;
    }
    p {
      @apply tw-m-0;
    }
  }
  &__doclink {
    @apply tw-self-start tw-text-xs tw-underline;
    color: var(--primary-600, var(--primary-500));
  }
  &__token {
    font-family: var(--font-mono, ui-monospace, monospace);
    @apply tw-text-xs tw-px-1.5 tw-rounded tw-text-start;
    min-height: 24px;
    background: var(--additional-50, #fff);
    border: 1px solid var(--neutrals-200);
    &:hover {
      border-color: var(--primary-400, var(--primary-500));
      color: var(--primary-700);
    }
  }
  &__code {
    font-family: var(--font-mono, ui-monospace, monospace);
    @apply tw-text-xs tw-px-1 tw-rounded;
    background: var(--neutrals-100);
  }
}
</style>
