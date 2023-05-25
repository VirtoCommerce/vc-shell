<template>
  <div class="vc-app tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-m-0 vc-theme_light">
    <VcLoading
      v-if="loading"
      active
    ></VcLoading>

    <VcLoginForm
      logo="/assets/logo-white.svg"
      background="/assets/background.jpg"
      :title="$t('INVITATION.TITLE')"
    >
      <VcForm>
        <VcInput
          class="tw-mb-4 tw-mt-1"
          :label="$t('INVITATION.FIELDS.EMAIL.LABEL')"
          :model-value="userName"
          name="username"
          disabled
        ></VcInput>
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="$t('INVITATION.FIELDS.PASSWORD.LABEL')"
          :model-value="form.password"
          rules="required"
          name="password"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.password"
            class="tw-mb-4 tw-mt-1"
            :label="$t('INVITATION.FIELDS.PASSWORD.LABEL')"
            :placeholder="$t('INVITATION.FIELDS.PASSWORD.PLACEHOLDER')"
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
          :label="$t('INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
          :model-value="form.confirmPassword"
          rules="required"
          name="confirm_password"
        >
          <VcInput
            v-bind="field"
            ref="confirmPasswordField"
            v-model="form.confirmPassword"
            class="tw-mb-4"
            :label="$t('INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
            :placeholder="$t('INVITATION.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')"
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
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
          <vc-button
            :disabled="loading || !form.isValid || !form.tokenIsValid"
            @click="acceptInvitation"
          >
            {{ $t("INVITATION.ACCEPT_INVITATION") }}
          </vc-button>
        </div>

        <VcHint
          v-for="error in form.errors"
          :key="error"
          class="tw-mt-3"
          style="color: #f14e4e"
        >
          <!-- TODO: stylizing-->
          {{ $t(`INVITATION.ERRORS.${error}`) }}
        </VcHint>
      </VcForm>
    </VcLoginForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useUser } from "./../../../../../core/composables";

useForm({ validateOnMount: false });

const props = defineProps({
  userId: {
    type: String,
    default: undefined,
  },
  userName: {
    type: String,
    default: undefined,
  },
  token: {
    type: String,
    default: undefined,
  },
});
const { validateToken, validatePassword, resetPasswordByToken, signIn, loading } = useUser();
const router = useRouter();
const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();
const form = reactive({
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
    form.errors = errors.map((x) => x.code);
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
      form.errors = [result.errorCode];
    }
  } else {
    form.errors = result.errors;
  }
};
</script>
