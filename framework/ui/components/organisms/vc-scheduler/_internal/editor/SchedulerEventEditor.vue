<template>
  <VcPopup
    :model-value="open"
    :title="$t(mode === 'edit' ? 'VC_SCHEDULER.EDIT_EVENT' : 'VC_SCHEDULER.NEW_EVENT')"
    modal-width="tw-max-w-lg"
    @update:model-value="onVisibilityChange"
  >
    <template #content>
      <div class="vc-scheduler__editor">
        <!-- VcPopup already renders :title in its own header bar; this is an
             sr-only duplicate so the modal's mode heading is also reachable
             from within the content region (and testable without stubbing VcPopup's header slot). -->
        <h3 class="tw-sr-only">
          {{ $t(mode === "edit" ? "VC_SCHEDULER.EDIT_EVENT" : "VC_SCHEDULER.NEW_EVENT") }}
        </h3>

        <VcInput
          :model-value="local.title"
          :label="$t('VC_SCHEDULER.TITLE')"
          data-test="editor-title"
          @update:model-value="(v) => (local.title = (v as string) ?? '')"
        />

        <VcSwitch
          :model-value="local.allDay"
          :label="$t('VC_SCHEDULER.ALL_DAY')"
          @update:model-value="(v) => (local.allDay = !!v)"
        />

        <div class="vc-scheduler__editor-row">
          <VcDatePicker
            :model-value="local.start"
            :type="dateType"
            :label="$t('VC_SCHEDULER.START')"
            class="vc-scheduler__editor-field"
            @update:model-value="(v) => v && (local.start = v as Date)"
          />
          <VcDatePicker
            :model-value="endFieldValue"
            :type="dateType"
            :label="$t('VC_SCHEDULER.END')"
            class="vc-scheduler__editor-field"
            @update:model-value="(v) => v && setEnd(v as Date)"
          />
        </div>

        <!-- Manual color override, hidden by default: colors are auto-derived from the
             title. The value stays a clean hex (no raw CSS-var strings surface); a "Default
             color" entry is selected when the event has no explicit color. -->
        <VcSelect
          v-if="allowColor"
          :model-value="local.color ?? DEFAULT_COLOR"
          :label="$t('VC_SCHEDULER.COLOR')"
          :options="colorOptions"
          option-value="value"
          option-label="label"
          data-test="editor-color"
          @update:model-value="(v) => (local.color = v && v !== DEFAULT_COLOR ? (v as string) : undefined)"
        >
          <template #option="{ opt }">
            <span class="vc-scheduler__color-option">
              <span
                class="vc-scheduler__color-dot"
                :style="{
                  background:
                    (opt as ColorOption).value === DEFAULT_COLOR ? 'var(--primary-500)' : (opt as ColorOption).value,
                }"
              />
              {{ (opt as ColorOption).label }}
            </span>
          </template>
        </VcSelect>

        <!-- Recurrence: hidden entirely for a single-occurrence ("this" scope) edit — an
             override isn't itself recurring. "none" clears local.recurrence; a real freq
             shows interval/weekday/end sub-fields below. See freqModel for the none<->freq
             switching semantics. -->
        <template v-if="allowRecurrence">
          <VcSelect
            :model-value="freqModel"
            :label="$t('VC_SCHEDULER.REPEAT')"
            :options="freqOptions"
            option-value="value"
            option-label="label"
            :clearable="false"
            data-test="editor-repeat"
            @update:model-value="(v) => (freqModel = v as RecurrenceFreqModel)"
          />

          <div
            v-if="local.recurrence"
            class="vc-scheduler__recur"
          >
            <div class="vc-scheduler__editor-row">
              <VcInput
                :model-value="local.recurrence.interval"
                type="number"
                :label="$t('VC_SCHEDULER.REPEAT_EVERY')"
                class="vc-scheduler__editor-field"
                data-test="recur-interval"
                @update:model-value="(v) => setRecurInterval(v)"
              />
              <span class="vc-scheduler__recur-unit">{{ recurUnitLabel }}</span>
            </div>

            <div
              v-if="local.recurrence.freq === 'weekly'"
              class="vc-scheduler__recur-weekly"
            >
              <span class="vc-scheduler__recur-caption">{{ $t("VC_SCHEDULER.REPEAT_ON") }}</span>
              <div class="vc-scheduler__recur-weekdays">
                <button
                  v-for="day in weekdayOptions"
                  :key="day.value"
                  type="button"
                  class="vc-scheduler__recur-weekday"
                  :class="{ 'vc-scheduler__recur-weekday--selected': isRecurWeekdaySelected(day.value) }"
                  :aria-pressed="isRecurWeekdaySelected(day.value)"
                  :aria-label="day.fullLabel"
                  data-test="recur-weekday"
                  @click="toggleRecurWeekday(day.value)"
                >
                  {{ day.label }}
                </button>
              </div>
            </div>

            <div class="vc-scheduler__editor-row">
              <VcSelect
                :model-value="recurEndType"
                :label="$t('VC_SCHEDULER.REPEAT_END')"
                :options="endOptions"
                option-value="value"
                option-label="label"
                class="vc-scheduler__editor-field"
                data-test="recur-end-type"
                @update:model-value="(v) => setRecurEndType(v as IRecurrenceRule['end']['type'])"
              />
              <VcDatePicker
                v-if="recurEndType === 'until'"
                :model-value="recurEndUntil"
                type="date"
                :label="$t('VC_SCHEDULER.REPEAT_END_UNTIL')"
                class="vc-scheduler__editor-field"
                data-test="recur-end-until"
                @update:model-value="(v) => setRecurEndUntil(v as Date)"
              />
              <VcInput
                v-if="recurEndType === 'count'"
                :model-value="recurEndCount"
                type="number"
                :label="$t('VC_SCHEDULER.REPEAT_END_COUNT')"
                class="vc-scheduler__editor-field"
                data-test="recur-end-count"
                @update:model-value="(v) => setRecurEndCount(v)"
              />
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="vc-scheduler__editor-footer">
        <VcButton
          v-if="mode === 'edit'"
          variant="danger"
          data-test="editor-delete"
          @click="onDelete"
        >
          {{ $t("VC_SCHEDULER.DELETE") }}
        </VcButton>
        <div class="vc-scheduler__editor-footer-spacer" />
        <VcButton
          variant="secondary"
          data-test="editor-cancel"
          @click="emit('close')"
        >
          {{ $t("VC_SCHEDULER.CANCEL") }}
        </VcButton>
        <VcButton
          variant="primary"
          data-test="editor-save"
          :disabled="!isValid"
          @click="onSave"
        >
          {{ $t("VC_SCHEDULER.SAVE") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { addDays, addMonths, format, startOfDay, startOfWeek } from "date-fns";
import { VcPopup } from "@ui/components/organisms/vc-popup";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcSwitch } from "@ui/components/molecules/vc-switch";
import { VcDatePicker } from "@ui/components/molecules/vc-date-picker";
import { VcSelect } from "@ui/components/molecules/vc-select";
import { VcButton } from "@ui/components/atoms/vc-button";
import { useI18n } from "vue-i18n";
import type { IEventDraft, IRecurrenceRule } from "../../types";

const DEFAULT_COLOR = "default";

interface ColorOption {
  value: string;
  label: string;
}

const { t } = useI18n();

// Curated set of colors (plain hex so the value renders directly as a bar
// background and never surfaces as a raw CSS-var string in the UI). The first
// entry is the sentinel default — selected whenever the event has no explicit
// color (VcSelect shows a placeholder, not an option, for a null value).
const colorOptions = computed<ColorOption[]>(() => {
  const opts: ColorOption[] = [
    { value: DEFAULT_COLOR, label: t("VC_SCHEDULER.COLOR_DEFAULT") },
    { value: "#3b82f6", label: t("VC_SCHEDULER.COLOR_BLUE") },
    { value: "#22c55e", label: t("VC_SCHEDULER.COLOR_GREEN") },
    { value: "#f59e0b", label: t("VC_SCHEDULER.COLOR_AMBER") },
    { value: "#ef4444", label: t("VC_SCHEDULER.COLOR_RED") },
    // violet-600, not -500: -500 (#8b5cf6) sits in a contrast valley where neither
    // white nor dark ink clears AA (best 4.23:1), so no readableInk choice can save it.
    { value: "#7c3aed", label: t("VC_SCHEDULER.COLOR_PURPLE") },
    { value: "#ec4899", label: t("VC_SCHEDULER.COLOR_PINK") },
    { value: "#14b8a6", label: t("VC_SCHEDULER.COLOR_TEAL") },
    { value: "#64748b", label: t("VC_SCHEDULER.COLOR_SLATE") },
  ];
  // An event may carry a color outside the preset set (a custom hex or a CSS-var
  // token). Surface it as a "Custom color" swatch instead of leaking the raw
  // value string into the select's display.
  const cur = local.color;
  if (cur && !opts.some((o) => o.value === cur)) {
    opts.push({ value: cur, label: t("VC_SCHEDULER.COLOR_CUSTOM") });
  }
  return opts;
});

export interface Props {
  open: boolean;
  draft: IEventDraft;
  mode: "create" | "edit";
  /** When false, hides the recurrence block entirely — used for a single-occurrence
   *  ("this" scope) edit, where an override isn't itself recurring. */
  allowRecurrence?: boolean;
  /** When false (default), hides the manual Color field — colors are auto-derived from
   *  the title, so users don't pick them. Enable to expose a manual override. */
  allowColor?: boolean;
}

export interface Emits {
  (event: "save", value: IEventDraft): void;
  (event: "delete", value: { id: string }): void;
  (event: "close"): void;
}

const props = withDefaults(defineProps<Props>(), { allowRecurrence: true, allowColor: false });
const emit = defineEmits<Emits>();

const local = reactive<IEventDraft>({ ...props.draft });

watch(
  () => props.draft,
  (d) => {
    // Object.assign never removes keys, so a create-mode draft (no `id`) arriving after
    // a prior edit-mode draft would otherwise leave a stale `local.id` behind.
    const bag = local as Record<string, unknown>;
    Object.keys(bag).forEach((k) => delete bag[k]);
    Object.assign(local, d);
  },
);

// VcDatePicker has no dedicated time mode; "datetime-local" enables its inline time picker.
// All-day events only need the date part, so we drop time mode when allDay is on.
const dateType = computed(() => (local.allDay ? "date" : "datetime-local"));

/**
 * All-day spans are stored with an **exclusive** end — midnight of the day after
 * the last day — but the field shows the last day the event actually covers, the
 * same day the chip and the quick-info popover announce (VCST-5678).
 *
 * Showing the raw stored value made "the same day as Start" mean an empty range:
 * it saved, laid out to nothing, and the event was invisible and unreachable with
 * no error anywhere (VCST-5803).
 */
const endFieldValue = computed(() => (local.allDay ? new Date(local.end.getTime() - 1) : local.end));

function setEnd(value: Date) {
  local.end = local.allDay ? startOfDay(addDays(value, 1)) : value;
}

// The all-day exemption is gone: with the field inclusive, End = Start is a
// one-day event rather than an empty range, so there is nothing left to exempt —
// and an End before Start is now refused instead of saved into the void.
const isValid = computed(() => local.title.trim().length > 0 && local.end > local.start);

type RecurrenceFreqModel = "none" | IRecurrenceRule["freq"];

const freqOptions = computed(() => [
  { value: "none", label: t("VC_SCHEDULER.REPEAT_NONE") },
  { value: "daily", label: t("VC_SCHEDULER.REPEAT_DAILY") },
  { value: "weekly", label: t("VC_SCHEDULER.REPEAT_WEEKLY") },
  { value: "monthly", label: t("VC_SCHEDULER.REPEAT_MONTHLY") },
  { value: "yearly", label: t("VC_SCHEDULER.REPEAT_YEARLY") },
]);

const endOptions = computed(() => [
  { value: "never", label: t("VC_SCHEDULER.REPEAT_END_NEVER") },
  { value: "until", label: t("VC_SCHEDULER.REPEAT_END_UNTIL") },
  { value: "count", label: t("VC_SCHEDULER.REPEAT_END_COUNT") },
]);

// A fixed reference Sunday purely to derive narrow weekday labels; the resulting `value`s are
// plain JS getDay() indices (0=Sun..6=Sat), matching IRecurrenceRule.byWeekday's convention.
const weekdayOptions = computed(() => {
  const sunday = startOfWeek(new Date(), { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sunday, i);
    // The narrow "EEEEE" label (S/M/T/W/T/F/S) is ambiguous on its own -- Sun/Sat and
    // Tue/Thu collide -- so aria-label carries the unambiguous full weekday name instead.
    return { value: i, label: format(d, "EEEEE"), fullLabel: format(d, "EEEE") };
  });
});

const recurUnitLabel = computed(() => {
  switch (local.recurrence?.freq) {
    case "daily":
      return t("VC_SCHEDULER.REPEAT_UNIT_DAYS");
    case "weekly":
      return t("VC_SCHEDULER.REPEAT_UNIT_WEEKS");
    case "monthly":
      return t("VC_SCHEDULER.REPEAT_UNIT_MONTHS");
    case "yearly":
      return t("VC_SCHEDULER.REPEAT_UNIT_YEARS");
    default:
      return "";
  }
});

// Read through computeds (rather than `local.recurrence.end.type === "..."` in the template)
// so the discriminated union's `until`/`count` fields don't need narrowing at the call site.
const recurEndType = computed(() => local.recurrence?.end.type ?? "never");
const recurEndUntil = computed(() => (local.recurrence?.end.type === "until" ? local.recurrence.end.until : null));
const recurEndCount = computed(() => (local.recurrence?.end.type === "count" ? local.recurrence.end.count : 1));

// "none" clears the rule. A real freq initializes a fresh one the first time (interval 1,
// "never" end, and — for weekly — the draft's own start weekday preselected). Switching
// between real freqs (daily <-> weekly <-> ...) preserves the existing interval/end instead
// of resetting them.
const freqModel = computed<RecurrenceFreqModel>({
  get: () => local.recurrence?.freq ?? "none",
  set: (freq) => {
    if (freq === "none") {
      local.recurrence = null;
      return;
    }
    local.recurrence = {
      interval: local.recurrence?.interval ?? 1,
      end: local.recurrence?.end ?? { type: "never" },
      freq,
      byWeekday: freq === "weekly" ? (local.recurrence?.byWeekday ?? [local.start.getDay()]) : undefined,
    };
  },
});

function isRecurWeekdaySelected(day: number): boolean {
  return !!local.recurrence?.byWeekday?.includes(day);
}

function toggleRecurWeekday(day: number) {
  if (!local.recurrence) return;
  const current = local.recurrence.byWeekday ?? [];
  local.recurrence.byWeekday = current.includes(day)
    ? current.filter((d) => d !== day)
    : [...current, day].sort((a, b) => a - b);
}

function setRecurInterval(value: string | number | Date | null | undefined) {
  if (!local.recurrence) return;
  const n = Math.trunc(Number(value));
  local.recurrence.interval = Number.isFinite(n) && n >= 1 ? n : 1;
}

function setRecurEndType(type: IRecurrenceRule["end"]["type"]) {
  if (!local.recurrence) return;
  if (type === "until") {
    // Default to one month out rather than the start date itself — until==dtstart would only
    // ever produce a single occurrence until the user picks a different date.
    local.recurrence.end = { type: "until", until: recurEndUntil.value ?? addMonths(local.start, 1) };
  } else if (type === "count") {
    local.recurrence.end = { type: "count", count: recurEndCount.value ?? 1 };
  } else {
    local.recurrence.end = { type: "never" };
  }
}

function setRecurEndUntil(value: Date | null | undefined) {
  if (!local.recurrence || local.recurrence.end.type !== "until" || !value) return;
  local.recurrence.end.until = value;
}

function setRecurEndCount(value: string | number | Date | null | undefined) {
  if (!local.recurrence || local.recurrence.end.type !== "count") return;
  const n = Math.trunc(Number(value));
  local.recurrence.end.count = Number.isFinite(n) && n >= 1 ? n : 1;
}

function onSave() {
  if (!isValid.value) return;
  // A weekly rule needs at least one selected day; if the user toggled the last one off,
  // fall back to the event's own start weekday rather than saving an empty rule.
  if (local.recurrence?.freq === "weekly" && !local.recurrence.byWeekday?.length) {
    local.recurrence.byWeekday = [local.start.getDay()];
  }
  emit("save", { ...local });
}

function onDelete() {
  // `local.id` is undefined for a "this"-scope occurrence edit with no override created yet;
  // the parent still needs this emit to route the delete through its recurrence-scope
  // context (VcScheduler's onEditorDelete), so this must not swallow the click.
  emit("delete", { id: local.id as string });
}

function onVisibilityChange(value: boolean) {
  if (!value) {
    emit("close");
  }
}
</script>

<style lang="scss">
.vc-scheduler {
  &__editor {
    @apply tw-flex tw-flex-col tw-gap-4 tw-w-full;
  }

  &__editor-row {
    // Grid, not flex: two equal tracks that each hold a full-width date-time field
    // on wide modals, collapsing to one stacked column on narrow ones. minmax(0,1fr)
    // + w-full field lets VueDatePicker's input fill the track so long datetime
    // values ("M/D/YYYY, HH:MM AM") never clip.
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 0.75rem;
  }

  &__editor-field {
    @apply tw-w-full tw-min-w-0;

    // VueDatePicker's inner input wrappers are flex boxes that don't stretch, so a
    // datetime value clips inside an otherwise-wide field. Force the picker subtree
    // to block-flow full width so the input fills the grid track.
    .vc-date-picker__field-container,
    .vc-date-picker__field,
    .dp__main,
    .dp__main > div,
    .dp__input_wrap {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
    }

    .dp__input {
      width: 100% !important;
      box-sizing: border-box;
    }
  }

  &__color-option {
    @apply tw-flex tw-items-center tw-gap-2;
  }

  &__color-dot {
    width: 0.875rem;
    height: 0.875rem;
    flex: none;
    border-radius: 9999px;
    box-shadow: 0 0 0 1px var(--neutrals-300);
  }

  &__recur {
    @apply tw-flex tw-flex-col tw-gap-3 tw-w-full;
  }

  &__recur-unit {
    @apply tw-flex tw-items-center tw-text-sm tw-text-[color:var(--neutrals-600)] tw-whitespace-nowrap;
  }

  &__recur-weekly {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__recur-caption {
    @apply tw-text-sm tw-text-[color:var(--neutrals-600)];
  }

  &__recur-weekdays {
    @apply tw-flex tw-flex-wrap tw-gap-1.5;
  }

  &__recur-weekday {
    @apply tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-solid
      tw-border-[color:var(--neutrals-300)] tw-bg-[color:var(--additional-50)]
      tw-text-sm tw-text-[color:var(--neutrals-700)] tw-cursor-pointer
      hover:tw-bg-[color:var(--neutrals-100)];

    &--selected {
      @apply tw-border-[color:var(--primary-500)] tw-bg-[color:var(--primary-500)] tw-text-[color:var(--additional-50)];
    }
  }

  &__editor-footer {
    @apply tw-flex tw-items-center tw-gap-3 tw-w-full;
  }

  &__editor-footer-spacer {
    @apply tw-flex-1;
  }
}
</style>
