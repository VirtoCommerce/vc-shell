# Basic Form Blade

**Pattern:** VcBlade + VcContainer + VcForm + fields

**Use:** Simple create/edit forms

**Based on:** fulfillment-center-details.vue, team-member-details.vue

## Composition

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="toolbar"
    :modified="modified"
    width="70%"
    @close="$emit('close:blade')"
  >
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol class="tw-space-y-4">
            <!-- Text field -->
            <Field v-slot="{ errorMessage, errors }" name="name" rules="required">
              <VcInput
                v-model="entity.name"
                :label="$t('FORM.NAME')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
              />
            </Field>

            <!-- Email field -->
            <Field v-slot="{ errorMessage, errors }" name="email" rules="required|email">
              <VcInput
                v-model="entity.email"
                type="email"
                :label="$t('FORM.EMAIL')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
              />
            </Field>

            <!-- Select field -->
            <Field v-slot="{ errorMessage, errors }" name="status" rules="required">
              <VcSelect
                v-model="entity.status"
                :label="$t('FORM.STATUS')"
                :options="statusOptions"
                option-value="value"
                option-label="label"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
              />
            </Field>

            <!-- Textarea -->
            <VcTextarea
              v-model="entity.description"
              :label="$t('FORM.DESCRIPTION')"
              :rows="4"
            />

            <!-- Switch -->
            <VcSwitch
              v-if="entity.id"
              v-model="entity.isActive"
              :label="$t('FORM.IS_ACTIVE')"
            />
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { Field, useForm } from "vee-validate";
import { useEntityDetails } from "../composables";

const { entity, loading, modified, createEntity, updateEntity, deleteEntity } = useEntityDetails();
const { meta } = useForm();

const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        entity.value.id ? await updateEntity(entity.value) : await createEntity(entity.value);
      }
    },
    disabled: computed(() => !(meta.value.valid && modified.value)),
  },
  {
    id: "delete",
    icon: "material-delete",
    async clickHandler() {
      if (await showConfirmation("Delete?")) {
        await deleteEntity({ id: entity.value.id });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!entity.value.id),
  },
]);
</script>
```

**Components Used:**
- VcBlade, VcContainer, VcForm
- VcRow, VcCol
- VcInput, VcSelect, VcTextarea, VcSwitch
- vee-validate Field

**Lines:** ~70

