import { defineComponent, effectScope, h, ref, type EffectScope } from "vue";
import type { SearchBarField, SearchBarState, SearchBarView } from "../types";
import { normalizeFields } from "../lib/fields";
import { useViews } from "../composables/useViews";

const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "paid", label: "Paid" },
        { value: "new", label: "New" },
      ],
      multiple: true,
    },
  },
  { id: "urgent", label: "Urgent", filter: { toggle: true } },
] as SearchBarField[]);

const MODULE: SearchBarView[] = [{ id: "paid", name: "Paid", values: { status: ["paid"] } }];

const scopes: EffectScope[] = [];
/** Stops the scopes of every makeViews call; run it in afterEach */
export const stopViews = () => scopes.splice(0).forEach((s) => s.stop());

/** A real useViews over in-memory storage and a plain state ref */
export function makeViews(moduleViews: SearchBarView[] = MODULE) {
  const state = ref<SearchBarState>({ search: "", values: {} });
  const scope = effectScope();
  scopes.push(scope);
  const views = scope.run(() =>
    useViews({
      storageKey: () => undefined,
      moduleViews: () => moduleViews,
      fields: () => fields,
      state,
      apply: (s) => (state.value = { search: state.value.search, values: { ...s.values } }),
      t: (k) => (k.endsWith("VIEWS.ALL") ? "All" : k),
    }),
  )!;
  /** Changes a filter, as the bar would */
  const setValues = (values: SearchBarState["values"]) => (state.value = { search: "", values });
  return { views, state, setValues };
}

/** `$t` that keeps the key and shows the params, e.g. `...SAVE_CHANGES:Paid` */
export const t = (k: string, p?: Record<string, unknown>) => (p ? `${k}:${Object.values(p).join(",")}` : k);

export const PopoverStub = defineComponent({
  name: "VcPopover",
  props: { show: Boolean, anchorRef: { type: Object, default: null }, role: String, ariaLabel: String },
  emits: ["update:show"],
  // the panel renders only while shown, as VcPopover does
  setup:
    (props, { slots }) =>
    () =>
      props.show ? h("div", { class: "popover-stub" }, slots.default?.()) : null,
});

export const InputStub = defineComponent({
  name: "VcInput",
  props: { modelValue: String, placeholder: String, size: String },
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h("input", {
        value: props.modelValue,
        placeholder: props.placeholder,
        onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
      }),
});

export const viewsGlobal = {
  stubs: { VcPopover: PopoverStub, VcInput: InputStub, VcIcon: true },
  mocks: { $t: t },
};

export const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.";
