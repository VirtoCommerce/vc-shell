# Error Handling & Validation

**Pattern:** Error display and validation

**Based on:** seller-details-edit.vue, offers-details.vue

## Error Banner

```vue
<VcBlade>
  <VcContainer>
    <!-- Error message banner -->
    <VcStatus
      v-if="errorMessage"
      variant="light-danger"
      :outline="false"
      extend
      class="tw-w-full tw-box-border tw-mb-3"
    >
      <div class="tw-flex tw-flex-row tw-items-center">
        <VcIcon icon="fas fa-exclamation-circle" class="tw-text-[#ff4a4a] tw-mr-3" size="xxl" />
        <div>
          <div class="tw-font-bold">Error</div>
          <div>{{ errorMessage }}</div>
        </div>
      </div>
    </VcStatus>

    <!-- Info banner -->
    <VcBanner v-if="!entity.id" variant="info-dark" icon="material-lightbulb">
      {{ $t("INFO_MESSAGE") }}
    </VcBanner>

    <VcForm>
      <!-- Form fields -->
    </VcForm>
  </VcContainer>
</VcBlade>
```

## Async Validation

```typescript
import { useDebounceFn } from "@vueuse/core";

const isValidating = ref(false);

const validate Field = (value: string, field: string) => {
  isValidating.value = true;

  const debouncedValidation = useDebounceFn(async () => {
    const errors = await validateEntity({ ...entity.value, [field]: value });
    const fieldErrors = errors?.filter(e => e.propertyName === field);
    
    setFieldError(
      field,
      fieldErrors.map(e => t(`ERRORS.${e.errorCode}`)).join("\n")
    );
    
    isValidating.value = false;
  }, 1000);

  debouncedValidation();
};
```

```vue
<Field v-slot="{ errors, errorMessage, handleChange }" name="code" rules="required">
  <VcInput
    v-model="entity.code"
    :loading="isValidating"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="(val) => { handleChange(val); validateField(val, 'code'); }"
  />
</Field>
```

**Components:**
- VcStatus, VcBanner, VcIcon
- VcInput with loading state

**Lines:** ~40

