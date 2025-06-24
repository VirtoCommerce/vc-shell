<template>
  <div class="vc-reset-password-page">
    <VcLoading
      v-if="loading"
      active
    ></VcLoading>

    <VcLoginForm
      :logo="customization.logo"
      :background="background"
      :title="t('PASSWORDRESET.TITLE')"
      class="vc-reset-password-page__login-form"
    >
      <VcForm>
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="t('PASSWORDRESET.FIELDS.PASSWORD.LABEL')"
          name="password"
          :model-value="form.password"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.password"
            class="vc-reset-password-page__input"
            :label="t('PASSWORDRESET.FIELDS.PASSWORD.LABEL')"
            :placeholder="t('PASSWORDRESET.FIELDS.PASSWORD.PLACEHOLDER')"
            type="password"
            :disabled="!form.tokenIsValid"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
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
          :label="t('PASSWORDRESET.FIELDS.CONFIRM_PASSWORD.LABEL')"
          name="confirm_password"
          :model-value="form.confirmPassword"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="confirmPasswordField"
            v-model="form.confirmPassword"
            class="vc-reset-password-page__input-small"
            :label="t('PASSWORDRESET.FIELDS.CONFIRM_PASSWORD.LABEL')"
            :placeholder="t('PASSWORDRESET.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')"
            :disabled="!form.tokenIsValid"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="
              (e) => {
                handleChange(e);
                validate();
              }
            "
            @keyup.enter="resetPassword"
          >
          </VcInput>
        </Field>
        <div class="vc-reset-password-page__button-container">
          <span
            v-if="$isDesktop.value"
            class="vc-reset-password-page__spacer"
          ></span>
          <vc-button
            :disabled="disableButton"
            class="vc-reset-password-page__submit-button"
            @click="resetPassword"
          >
            {{ t("PASSWORDRESET.SAVE_PASSWORD") }}
          </vc-button>
        </div>

        <VcHint
          v-for="error in form.errors"
          :key="error"
          class="vc-reset-password-page__error-hint"
          style="color: #f14e4e"
        >
          <!-- TODO: stylizing-->
          {{ t(`PASSWORDRESET.ERRORS.${error}`) }}
        </VcHint>
      </VcForm>
    </VcLoginForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Field, useForm } from "vee-validate";
import { useSettings } from "./../../../../../core/composables";
import { useI18n } from "vue-i18n";
import { useUserManagement } from "./../../../../../core/composables/useUserManagement";

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
const { validate: veeValidate } = useForm({ validateOnMount: false });
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

onMounted(async () => {
  form.tokenIsValid = await validateToken(props.userId, props.token);
  if (!form.tokenIsValid) {
    form.errors.push("Invalid-token");
  }
});

const disableButton = computed(() => {
  return loading.value || !form.password || !form.confirmPassword || (!form.isValid && form.tokenIsValid);
});

const validate = async () => {
  if (form.tokenIsValid) {
    const errors = (await validatePassword(form.password)).errors;
    form.errors = errors?.map((x) => x.code) as string[];
    if (form.confirmPassword !== form.password) {
      form.errors.push("Repeat-password");
    }
    form.isValid = form.errors.length == 0;
  }
};

const resetPassword = async () => {
  const { valid } = await veeValidate();
  if (valid) {
    const result = await resetPasswordByToken(props.userId, form.password, props.token);
    if (result.succeeded) {
      const loginResult = await signIn(props.userName, form.password);
      if (loginResult.succeeded) {
        router.push("/");
      } else {
        form.errors = ("error" in loginResult && [loginResult.error as string]) || [];
      }
    } else {
      form.errors = result.errors as string[];
    }
  }
};

const customization = computed(() => {
  return {
    logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
  };
});
</script>

<style lang="scss">
:root {
  --reset-password-error-color: var(--danger-500);
}

.vc-reset-password-page {
  @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-m-0;
}

.vc-reset-password-page__input {
  @apply tw-mb-4 tw-mt-1;
}

.vc-reset-password-page__input-small {
  @apply tw-mb-4;
}

.vc-reset-password-page__button-container {
  @apply tw-flex tw-justify-center tw-items-center tw-pt-2;
}

.vc-reset-password-page__spacer {
  @apply tw-grow tw-basis-0;
}

.vc-reset-password-page__submit-button {
  @apply tw-w-28;
}

.vc-reset-password-page__error-hint {
  @apply tw-mt-3 tw-text-[color:var(--reset-password-error-color)] #{!important};
}
</style>
