<template>
  <VcAuthLayout
    :logo="customization.logo"
    :background="background"
    :title="forgotPasswordRequestSent ? t('FORGOT_PASSWORD.SUCCESS_TITLE') : t('FORGOT_PASSWORD.TITLE')"
    :subtitle="forgotPasswordRequestSent ? undefined : t('FORGOT_PASSWORD.SUBTITLE')"
  >
    <!-- Request form -->
    <template v-if="!forgotPasswordRequestSent">
      <VcForm @submit.prevent="forgot">
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :label="t('FORGOT_PASSWORD.FIELDS.EMAIL.LABEL')"
          name="loginOrEmail"
          :model-value="form.loginOrEmail"
          rules="required|email"
        >
          <VcInput
            ref="emailField"
            v-model="form.loginOrEmail"
            class="tw-mb-6"
            :label="t('FORGOT_PASSWORD.FIELDS.EMAIL.LABEL')"
            :placeholder="t('FORGOT_PASSWORD.FIELDS.EMAIL.PLACEHOLDER')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>

        <VcButton
          variant="primary"
          class="tw-w-full tw-mb-4"
          :disabled="!isValid || loading"
          :loading="loading"
          @click="forgot"
        >
          {{ t("FORGOT_PASSWORD.SEND_BUTTON") }}
        </VcButton>

        <div class="tw-text-center">
          <VcButton
            variant="link"
            icon="fas fa-arrow-left"
            icon-size="xs"
            type="button"
            @click="goBack"
          >
            {{ t("FORGOT_PASSWORD.BACK_TO_LOGIN") }}
          </VcButton>
        </div>
      </VcForm>

      <VcHint
        v-if="error"
        class="tw-mt-3 tw-text-[color:var(--danger-500)]"
      >
        {{ error }}
      </VcHint>
    </template>

    <!-- Success state -->
    <template v-else>
      <div class="tw-text-center tw-mb-6">
        <p class="tw-text-sm tw-text-[var(--neutrals-600)]">
          {{ t("FORGOT_PASSWORD.SUCCESS_TEXT", { email: maskedEmail }) }}
        </p>
      </div>

      <VcButton
        variant="primary"
        class="tw-w-full"
        @click="goBack"
      >
        {{ t("FORGOT_PASSWORD.BACK_TO_LOGIN") }}
      </VcButton>
    </template>
  </VcAuthLayout>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useForm } from "vee-validate";
import { useSettings } from "./../../../../../core/composables";
import { useUserManagement } from "./../../../../../core/composables/useUserManagement";
import { useI18n } from "vue-i18n";

type ForgotPasswordFunc = (args: { loginOrEmail: string }) => Promise<void>;

export interface Props {
  logo?: string;
  background?: string;
  composable?: () => { forgotPassword: ForgotPasswordFunc };
}

const props = defineProps<Props>();

const router = useRouter();
const { t } = useI18n({ useScope: "global" });
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const { uiSettings, loading: customizationLoading } = useSettings();

const loading = ref(false);
const error = ref("");
const forgotPasswordRequestSent = ref(false);

const form = reactive({
  loginOrEmail: "",
});

let forgotPassword: ForgotPasswordFunc | undefined;

if (props.composable && typeof props.composable === "function") {
  const result = props.composable();
  forgotPassword = result.forgotPassword;
} else {
  const { requestPasswordReset } = useUserManagement();
  forgotPassword = async (args: { loginOrEmail: string }) => {
    await requestPasswordReset(args.loginOrEmail);
  };
}

const customization = computed(() => ({
  logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
}));

const maskedEmail = computed(() => {
  const email = form.loginOrEmail;
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const masked = name.length > 2 ? name[0] + "***" + name[name.length - 1] : name[0] + "***";
  return `${masked}@${domain}`;
});

const forgot = async () => {
  if (!isValid.value || !forgotPassword) return;

  try {
    loading.value = true;
    error.value = "";
    await forgotPassword({ loginOrEmail: form.loginOrEmail });
    forgotPasswordRequestSent.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: "Login" });
};
</script>
