# 1. Validation stays outside form controls

Status: Accepted

Date: 2026-08-25

## Context

Form validation in vc-shell is wired per field. The blade author wraps a `Vc*` control in vee-validate's `<Field>` and passes the slot props down:

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :label="$t('...NAME.LABEL')" name="name" rules="required" :model-value="details.name">
  <VcInput
    v-model="details.name"
    :label="$t('...NAME.LABEL')"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

There are 55 such sites across 19 files in the framework and the reference app. Several facts are stated twice per field (label, required, the model), and the `v-slot` destructuring varies from site to site. None of the text and choice controls (`vc-input`, `vc-textarea`, `vc-select`, `vc-multivalue`, `vc-editor`, `vc-date-picker`, `vc-color-input`, `vc-checkbox`, `vc-switch`) calls `useField()`; they are validation-agnostic and receive `error`, `errorMessage`, `required` and `label` as plain props via `IFormFieldProps` (`framework/ui/types/form-field.ts`), with ids and aria wiring computed by `useFormField` (`framework/ui/composables/useFormField.ts`). The one exception is `vc-file-upload`, which calls `useField()` directly.

Because the boilerplate is visible and repetitive, folding validation into the controls is proposed regularly: make `<VcInput v-model name rules label />` self-validating by calling `useField()` inside the control.

## Decision

Validation stays outside the controls. Controls remain validation-agnostic; the blade author composes `<Field>` or `useField` around them.

Application developers keep the freedom to choose the validation strategy per form: which library, when validation runs, where the error is rendered, and whether a field is validated at all. Controls that know about vee-validate would take that choice away, or would need enough configuration to hand it back. The boilerplate is a known and accepted cost of that freedom.

## Consequences

- Controls work with vee-validate, with another validation library, or with none. A control can be used in a read-only view, a filter panel or a wizard step without dragging validation machinery in.
- Error and label placement is decided per form rather than by the control.
- Each validated field costs roughly 15 to 20 lines, and the same fact is written in more than one place. Authors must keep the `Field` and the control in sync by hand.
- The `v-slot` shape is a per-site convention rather than a contract, so field markup drifts between modules.
- Reviews and refactoring proposals must not re-suggest folding `<Field>` into the controls. Reopen this decision only if the cost changes materially, for example if vee-validate offers a control-level integration that preserves the per-form choice.

This decision is about _validation_, not about markup. Sharing the label, hint and error chrome between controls is still allowed and desirable: those blocks are currently duplicated across the nine controls and have already drifted (for example, `vc-editor` renders its error hint without an id, so `aria-describedby` has nothing to point at). Extracting that chrome into a shared internal component is compatible with this ADR as long as the extracted piece stays validation-agnostic.
