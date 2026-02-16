<template>
  <VcAuthLayout
    :logo="customization.logo"
    :background="background"
    :title="forced ? t('COMPONENTS.CHANGE_PASSWORD.TITLE_FORCED') : t('COMPONENTS.CHANGE_PASSWORD.TITLE')"
    :subtitle="forced ? t('COMPONENTS.CHANGE_PASSWORD.SUBTITLE_FORCED') : undefined"
  >
    <div
      v-if="forced"
      class="tw-mb-4"
    >
      <vc-status
        extend
        :outline="false"
        variant="info-dark"
      >
        <div class="tw-flex tw-flex-row tw-items-center tw-text-[color:var(--neutrals-800)]">
          <VcIcon
            icon="material-lightbulb"
            size="l"
            class="tw-mr-3"
          />
          <div>
            <p class="tw-m-0">{{ t("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL") }}</p>
          </div>
        </div>
      </vc-status>
    </div>

    <VcForm>
      <Field
        v-slot="{ field, errorMessage, errors }"
        :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
        name="current"
        rules="required|min:6"
        :model-value="form.currentPassword"
      >
        <VcInput
          v-bind="field"
          ref="passwordField"
          v-model="form.currentPassword"
          class="tw-mb-4"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')"
          type="password"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="validateForm"
        />
      </Field>

      <Field
        v-slot="{ field, errorMessage, errors }"
        :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
        name="new_pass"
        rules="required|min:6"
        :model-value="form.password"
      >
        <VcInput
          v-bind="field"
          ref="newPasswordField"
          v-model="form.password"
          class="tw-mb-4"
          :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          :placeholder="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
          type="password"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="validateForm"
        />
      </Field>

      <Field
        v-slot="{ field, errorMessage, errors }"
        :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
        name="confirm_pass"
        rules="required|min:6"
        :model-value="form.confirmPassword"
      >
        <VcInput
          v-bind="field"
          ref="confirmPasswordField"
          v-model="form.confirmPassword"
          class="tw-mb-6"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')"
          type="password"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="validateForm"
        />
      </Field>

      <div class="tw-flex tw-gap-3">
        <VcButton
          variant="secondary"
          class="tw-flex-1"
          @click="cancelChange"
        >
          {{ t("COMPONENTS.CHANGE_PASSWORD.CANCEL") }}
        </VcButton>
        <VcButton
          variant="primary"
          class="tw-flex-1"
          :disabled="loading || !form.isValid || isDisabled"
          :loading="loading"
          @click="changePassword"
        >
          {{ t("COMPONENTS.CHANGE_PASSWORD.SAVE") }}
        </VcButton>
      </div>

      <VcHint
        v-for="(err, i) in form.errors"
        :key="i"
        class="tw-mt-3 tw-text-[color:var(--danger-500)]"
      >
        {{
          (err as IIdentityError).code
            ? t(`COMPONENTS.CHANGE_PASSWORD.ERRORS.${(err as IIdentityError).code}`)
            : err
        }}
      </VcHint>
    </VcForm>
  </VcAuthLayout>
</template>

<script lang="ts" setup>
import { nextTick, reactive, computed } from "vue";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { IIdentityError } from "./../../../../../core/api/platform";
import { useUserManagement } from "./../../../../../core/composables/useUserManagement";
import { useSettings } from "./../../../../../core/composables";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

interface IChangePassForm {
  isValid: boolean;
  errors: IIdentityError[] | string[];
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export interface Props {
  forced?: boolean;
  logo?: string;
  background?: string;
}

const props = defineProps<Props>();

const { t } = useI18n({ useScope: "global" });
const { changeUserPassword, loading, validatePassword, signOut } = useUserManagement();
const { uiSettings, loading: customizationLoading } = useSettings();

const customization = computed(() => ({
  logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
}));
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const router = useRouter();

const form = reactive<IChangePassForm>({
  isValid: false,
  errors: [],
  currentPassword: "",
  password: "",
  confirmPassword: "",
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

async function cancelChange() {
  await signOut();
  await router.push("/login");
}

async function changePassword() {
  const result = await changeUserPassword(form.currentPassword, form.password);
  if (result?.succeeded) {
    await router.push("/");
  } else if (result?.errors) {
    form.errors = result?.errors;
    form.isValid = form.errors.length == 0;
  }
}

function validateForm() {
  nextTick(async () => {
    if (form.password || form.confirmPassword) {
      form.errors = (await validatePassword(form.password)).errors ?? [];
      if (form.confirmPassword !== form.password) {
        (form.errors as IIdentityError[]).push({ code: "Repeat-password" });
      }
      if (form.confirmPassword === form.currentPassword && form.password === form.currentPassword) {
        (form.errors as IIdentityError[]).push({ code: "Equal-passwords" });
      }
      form.isValid = form.errors.length == 0;
    }
  });
}
</script>
