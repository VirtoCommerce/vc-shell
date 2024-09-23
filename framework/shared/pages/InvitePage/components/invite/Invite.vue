<template>
  <div class="vc-invite-page">
    <VcLoading
      v-if="loading"
      active
    ></VcLoading>

    <VcLoginForm
      :logo="customization.logo"
      :background="background"
      :title="t('INVITATION.TITLE')"
    >
      <VcForm>
        <VcInput
          class="vc-invite-page__input"
          :label="t('INVITATION.FIELDS.EMAIL.LABEL')"
          :model-value="userName"
          name="username"
          disabled
        ></VcInput>

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
            class="vc-invite-page__input"
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
          ></VcInput>
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
            class="vc-invite-page__input--small"
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
          ></VcInput>
        </Field>

        <div class="vc-invite-page__button-container">
          <span
            v-if="$isDesktop.value"
            class="vc-invite-page__spacer"
          ></span>
          <vc-button
            :disabled="loading || !form.isValid || !form.tokenIsValid"
            @click="acceptInvitation"
          >
            {{ t("INVITATION.ACCEPT_INVITATION") }}
          </vc-button>
        </div>

        <VcHint
          v-for="error in form.errors"
          :key="error"
          class="vc-invite-page__hint"
          style="color: #f14e4e"
        >
          <!-- TODO: stylizing-->
          {{ t(`INVITATION.ERRORS.${error}`) }}
        </VcHint>
      </VcForm>
    </VcLoginForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useUser, useSettings } from "./../../../../../core/composables";
import { useI18n } from "vue-i18n";

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

const { validateToken, validatePassword, resetPasswordByToken, signIn, loading } = useUser();
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
    } else {
      // form.errors = [result.errorCode as string];
    }
  } else {
    form.errors = result.errors as string[];
  }
};

const customization = computed(() => {
  return {
    logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
  };
});
</script>

<style lang="scss">
.vc-invite-page {
  @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-m-0;
}

.vc-invite-page__input {
  @apply tw-mb-4 tw-mt-1;
}

.vc-invite-page__input--small {
  @apply tw-mb-4;
}

.vc-invite-page__button-container {
  @apply tw-flex tw-justify-center tw-items-center tw-pt-2;
}

.vc-invite-page__spacer {
  @apply tw-grow tw-basis-0;
}

.vc-invite-page__hint {
  @apply tw-mt-3;
}
</style>
