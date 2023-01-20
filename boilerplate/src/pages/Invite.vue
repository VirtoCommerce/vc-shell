<template>
  <div class="vc-app tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-m-0 vc-theme_light">
    <VcLoading v-if="loading" active></VcLoading>

    <VcLoginForm
      logo="/assets/logo-white.svg"
      background="/assets/background.jpg"
      :title="$t('SHELL.INVITATION.TITLE')"
    >
      <VcForm>
          <VcInput
            class="tw-mb-4 tw-mt-1"
            :label="$t('SHELL.INVITATION.FIELDS.EMAIL.LABEL')"
            :modelValue="userName"
            name="username"
            disabled
          ></VcInput>
          <Field v-slot="{field, errorMessage, handleChange, errors}" :modelValue="form.password" rules="required" name="password">
              <VcInput
                v-bind="field"
                ref="passwordField"
                class="tw-mb-4 tw-mt-1"
                :label="$t('SHELL.INVITATION.FIELDS.PASSWORD.LABEL')"
                :placeholder="$t('SHELL.INVITATION.FIELDS.PASSWORD.PLACEHOLDER')"
                type="password"
                :disabled="!form.tokenIsValid"
                v-model="form.password"
                @update:modelValue="(e) => {handleChange(e); validate()}"
                :error="!!errors.length"
               :error-message="errorMessage"
                required
          ></VcInput>
          </Field>
          <Field v-slot="{field, errorMessage, handleChange, errors}" :modelValue="form.confirmPassword" rules="required" name="confirm_password">
              <VcInput
                v-bind="field"
                ref="confirmPasswordField"
                class="tw-mb-4"
                :label="$t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
                :placeholder="$t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')"
                :disabled="!form.tokenIsValid"
                v-model="form.confirmPassword"
                type="password"
                @update:modelValue="(e) => {handleChange(e); validate()}"
                @keyup.enter="acceptInvitation"
                :error="!!errors.length"
               :error-message="errorMessage"
                required
              ></VcInput>
          </Field>
        <div class= "tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span v-if="$isDesktop.value" class="tw-grow tw-basis-0"></span>
          <vc-button
            variant="primary"
            :disabled="loading || !form.isValid || !form.tokenIsValid"
            @click="acceptInvitation"
          >
            {{ $t("SHELL.INVITATION.ACCEPT_INVITATION") }}
          </vc-button>
        </div>

        <VcHint
          class="tw-mt-3"
          style="color: #f14e4e"
          v-for="error in form.errors"
          :key="error"
        >
          <!-- TODO: stylizing-->
          {{ $t(`SHELL.INVITATION.ERRORS.${error}`) }}
        </VcHint>
      </VcForm>
    </VcLoginForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import {useUser, useForm, useI18n} from "@vc-shell/framework";
import { useRouter } from "vue-router";
import { useIsFormValid, Field } from "vee-validate";

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
const {
  validateToken,
  validatePassword,
  resetPasswordByToken,
  signIn,
  loading,
} = useUser();
const router = useRouter();
const isFormValid = useIsFormValid();
const { t } = useI18n();

const form = reactive({
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

const validate = async () => {
  if (form.tokenIsValid) {
    var errors = (await validatePassword(form.password)).errors;
    form.errors = errors.map((x) => x.code);
    if (form.confirmPassword && form.confirmPassword !== form.password) {
      form.errors.push("Repeat-password");
    }
    form.isValid = form.errors.length == 0 && isFormValid.value;
  }
};

const acceptInvitation = async () => {
  var result = await resetPasswordByToken(
    props.userId,
    form.password,
    props.token
  );
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
