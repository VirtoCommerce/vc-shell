<template>
  <div class="vc-app tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-m-0 vc-theme_light">
    <VcLoading
      v-if="loading"
      active
    ></VcLoading>

    <VcLoginForm
      logo="/assets/logo-white.svg"
      background="/assets/background.jpg"
      :title="t('PASSWORDRESET.TITLE')"
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
            class="tw-mb-4 tw-mt-1"
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
            class="tw-mb-4"
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
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
          <vc-button
            :disabled="disableButton"
            @click="resetPassword"
          >
            {{ t("PASSWORDRESET.SAVE_PASSWORD") }}
          </vc-button>
        </div>

        <VcHint
          v-for="error in form.errors"
          :key="error"
          class="tw-mt-3 !tw-text-[#f14e4e]"
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
import { useUser } from "./../../../../../core/composables";
import { useI18n } from "vue-i18n";

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
const { t } = useI18n({ useScope: "global" });
const { validate: veeValidate } = useForm({ validateOnMount: false });

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

const disableButton = computed(() => {
  return loading.value || !form.password || !form.confirmPassword || (!form.isValid && form.tokenIsValid);
});

const validate = async () => {
  if (form.tokenIsValid) {
    const errors = (await validatePassword(form.password)).errors;
    form.errors = errors.map((x) => x.code);
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
      const result = await signIn(props.userName, form.password);
      if (result.succeeded) {
        router.push("/");
      } else {
        form.errors = [result.errorCode];
      }
    } else {
      form.errors = result.errors;
    }
  }
};
</script>
