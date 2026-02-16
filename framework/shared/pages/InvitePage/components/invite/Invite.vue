<template>
  <VcAuthLayout
    :logo="customization.logo"
    :background="background"
    :title="t('INVITATION.TITLE')"
    :subtitle="t('INVITATION.SUBTITLE')"
  >
    <VcLoading
      v-if="loading"
      active
    />

    <VcForm>
      <VcInput
        class="tw-mb-4"
        :label="t('INVITATION.FIELDS.EMAIL.LABEL')"
        :model-value="userName"
        name="username"
        disabled
      />

      <Field
        v-slot="{ field, errorMessage, handleChange, errors }"
        :label="t('INVITATION.FIELDS.PASSWORD.LABEL')"
        :model-value="form.password"
        rules="required"
        name="password"
      >
        <VcInput
          v-bind="field"
          ref="passwordField"
          v-model="form.password"
          class="tw-mb-4"
          :label="t('INVITATION.FIELDS.PASSWORD.LABEL')"
          :placeholder="t('INVITATION.FIELDS.PASSWORD.PLACEHOLDER')"
          type="password"
          :disabled="!form.tokenIsValid"
          :error="!!errors.length"
          :error-message="errorMessage"
          required
          @update:model-value="
            (e) => {
              handleChange(e);
              validate();
            }
          "
        />
      </Field>

      <Field
        v-slot="{ field, errorMessage, handleChange, errors }"
        :label="t('INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
        :model-value="form.confirmPassword"
        rules="required"
        name="confirm_password"
      >
        <VcInput
          v-bind="field"
          ref="confirmPasswordField"
          v-model="form.confirmPassword"
          class="tw-mb-6"
          :label="t('INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
          :placeholder="t('INVITATION.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')"
          :disabled="!form.tokenIsValid"
          type="password"
          :error="!!errors.length"
          :error-message="errorMessage"
          required
          @update:model-value="
            (e) => {
              handleChange(e);
              validate();
            }
          "
          @keyup.enter="acceptInvitation"
        />
      </Field>

      <VcButton
        variant="primary"
        class="tw-w-full"
        :disabled="loading || !form.isValid || !form.tokenIsValid"
        :loading="loading"
        @click="acceptInvitation"
      >
        {{ t("INVITATION.ACCEPT_INVITATION") }}
      </VcButton>

      <VcHint
        v-for="error in form.errors"
        :key="error"
        class="tw-mt-3 tw-text-[color:var(--danger-500)]"
      >
        {{ t(`INVITATION.ERRORS.${error}`) }}
      </VcHint>
    </VcForm>
  </VcAuthLayout>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useSettings } from "./../../../../../core/composables";
import { useI18n } from "vue-i18n";
import { useUserManagement } from "./../../../../../core/composables/useUserManagement";

useForm({ validateOnMount: false });

const props = withDefaults(
  defineProps<{
    userId: string;
    userName: string;
    token: string;
    logo: string;
    background: string;
  }>(),
  {
    background: "/assets/background.jpg",
    logo: "/assets/logo-white.svg",
  },
);

const { validateToken, validatePassword, resetPasswordByToken, signIn, loading } = useUserManagement();
const router = useRouter();
const { t } = useI18n({ useScope: "global" });
const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();
const { uiSettings, loading: customizationLoading } = useSettings();

const form = reactive<{
  isValid: boolean;
  tokenIsValid: boolean;
  errors: string[];
  password: string;
  confirmPassword: string;
}>({
  isValid: false,
  tokenIsValid: false,
  errors: [],
  password: "",
  confirmPassword: "",
});

const isDisabled = computed(() => {
  return !isDirty.value || !isFormValid.value;
});

onMounted(async () => {
  form.tokenIsValid = await validateToken(props.userId, props.token);
  if (!form.tokenIsValid) {
    form.errors.push("Invalid-token");
  }
});

const validate = async () => {
  if (form.tokenIsValid) {
    const errors = (await validatePassword(form.password)).errors;
    form.errors = errors?.map((x) => x.code) as string[];
    if (form.confirmPassword && form.confirmPassword !== form.password) {
      form.errors.push("Repeat-password");
    }
    form.isValid = form.errors.length == 0 && !isDisabled.value;
  }
};

const acceptInvitation = async () => {
  const result = await resetPasswordByToken(props.userId, form.password, props.token);
  if (result.succeeded) {
    const result = await signIn(props.userName, form.password);
    if (result.succeeded) {
      router.push("/");
    }
  } else {
    form.errors = result.errors as string[];
  }
};

const customization = computed(() => ({
  logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
}));
</script>
