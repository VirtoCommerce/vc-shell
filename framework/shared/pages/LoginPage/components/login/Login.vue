<template>
  <VcLoginForm
    :logo="customization.logo"
    :background="background"
    :title="title"
  >
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="$t('LOGIN.FIELDS.LOGIN.LABEL')"
          name="username"
          :model-value="form.username"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="loginField"
            v-model="form.username"
            class="tw-mb-4 tw-mt-1"
            :label="$t('LOGIN.FIELDS.LOGIN.LABEL')"
            :placeholder="$t('LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="$t('LOGIN.FIELDS.PASSWORD.LABEL')"
          name="password"
          :model-value="form.password"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.password"
            class="tw-mb-4"
            :label="$t('LOGIN.FIELDS.PASSWORD.LABEL')"
            :placeholder="$t('LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @keyup.enter="login"
            @update:model-value="handleChange"
          />
        </Field>

        <div class="tw-flex tw-justify-end tw-items-center tw-pt-2">
          <VcButton
            text
            type="button"
            @click="togglePassRequest"
          >
            {{ $t("LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <vc-button
            :disabled="loading || !isValid"
            class="tw-w-28"
            @click="login"
          >
            {{ $t("LOGIN.BUTTON") }}
          </vc-button>
        </div>
      </VcForm>
      <div
        v-if="azureAdAuthAvailable && azureAdAuthCaption"
        class="tw-mt-4"
      >
        <div
          class="tw-flex tw-items-center tw-text-center tw-uppercase tw-text-[color:var(--separator-text)] before:tw-content-[''] before:tw-flex-1 before:tw-border-b before:tw-border-b-[color:var(--separator)] before:tw-mr-2 after:tw-content-[''] after:tw-flex-1 after:tw-border-b after:tw-border-b-[color:var(--separator)] after:tw-ml-2"
        >
          OR
        </div>
        <div class="tw-flex tw-justify-center tw-mt-4">
          <VcButton
            outline
            @click="azureSignOn"
            ><div class="tw-flex tw-flex-row tw-items-center">
              <img
                :src="AzureAdIcon"
                alt="AzureAd"
                class="tw-h-5 tw-mr-2"
              />{{ azureAdAuthCaption }}
            </div></VcButton
          >
        </div>
      </div>
    </template>
    <template v-else>
      <template v-if="!forgotPasswordRequestSent">
        <VcForm @submit.prevent="forgot">
          <Field
            v-slot="{ field, errorMessage, handleChange, errors }"
            :label="$t('LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            name="loginOrEmail"
            :model-value="forgotPasswordForm.loginOrEmail"
            rules="required|email"
          >
            <VcInput
              v-bind="field"
              ref="forgotPasswordField"
              v-model="forgotPasswordForm.loginOrEmail"
              class="tw-mb-4 tw-mt-1"
              :label="$t('LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
              :placeholder="$t('LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
              :hint="$t('LOGIN.RESET_EMAIL_TEXT')"
              required
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            ></VcInput>
          </Field>
          <div class="tw-flex tw-justify-between tw-items-center tw-pt-2">
            <vc-button
              text
              type="button"
              @click="togglePassRequest"
            >
              {{ $t("LOGIN.BACK_BUTTON") }}
            </vc-button>
            <vc-button
              :disabled="loading || isDisabled"
              @click="forgot"
            >
              {{ $t("LOGIN.FORGOT_BUTTON") }}
            </vc-button>
          </div>
        </VcForm>
      </template>

      <template v-if="requestPassResult.succeeded && forgotPasswordRequestSent">
        <div>{{ $t("LOGIN.RESET_EMAIL_SENT") }}</div>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
          <vc-button
            :disabled="loading"
            @click="togglePassRequest"
          >
            {{ $t("LOGIN.BUTTON_OK") }}
          </vc-button>
        </div>
      </template>
    </template>

    <VcHint
      v-if="!signInResult.succeeded"
      class="tw-mt-3"
      style="color: #f14e4e"
    >
      <!-- TODO: stylizing-->
      {{ signInResult.error }}
    </VcHint>
    <VcHint
      v-if="!requestPassResult.succeeded"
      class="tw-mt-3"
      style="color: #f14e4e"
    >
      <!-- TODO: stylizing-->
      {{ requestPassResult.error }}
    </VcHint>
  </VcLoginForm>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useSettings, useUser } from "./../../../../../core/composables";
import { RequestPasswordResult, SignInResults } from "./../../../../../core/types";
import { CommonPageComposables } from "typings";
import { asyncComputed } from "@vueuse/core";
import AzureAdIcon from "./../../../../../assets/img/AzureAd.svg";

export interface Props {
  logo: string;
  background: string;
  title: string;
}

const props = defineProps<Props>();

const router = useRouter();

useForm({ validateOnMount: false });
const { getUiCustomizationSettings, uiSettings } = useSettings();
const { useLogin } = inject<CommonPageComposables>("commonPageComposables");

const signInResult = ref<SignInResults>({ succeeded: true });
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading, loadUser, externalSignIn, isAzureAdAuthAvailable, getAzureAdAuthCaption } = useUser();
const { forgotPassword } = useLogin();
const isLogin = ref(true);
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const customizationLoading = ref(false);

onMounted(async () => {
  try {
    customizationLoading.value = true;
    await getUiCustomizationSettings(import.meta.env.APP_PLATFORM_URL);
  } finally {
    customizationLoading.value = false;
  }
});

const customization = computed(() => {
  return (
    !customizationLoading.value && {
      logo: uiSettings.value?.logo || props.logo,
    }
  );
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const azureAdAuthAvailable = asyncComputed(async () => {
  return await isAzureAdAuthAvailable();
});
const azureAdAuthCaption = asyncComputed(async () => {
  return await getAzureAdAuthCaption();
});

const form = reactive({
  username: "",
  password: "",
});

const forgotPasswordForm = reactive({
  loginOrEmail: "",
});

const login = async () => {
  if (isValid.value) {
    signInResult.value = await signIn(form.username, form.password);

    if (signInResult.value.succeeded) {
      router.push("/");
    }
  }
};

const forgot = async () => {
  if (isValid.value) {
    await forgotPassword({ loginOrEmail: forgotPasswordForm.loginOrEmail });
    forgotPasswordRequestSent.value = true;
  }
};

const togglePassRequest = () => {
  isLogin.value = !isLogin.value;
  if (isLogin.value) {
    forgotPasswordRequestSent.value = false;
    forgotPasswordForm.loginOrEmail = "";
    requestPassResult.value.error = "";
  }
};

const azureSignOn = async () => {
  await externalSignIn("AzureAD", import.meta.env.BASE_URL);
  await loadUser();
};

console.debug("Init login-page");
</script>

<style lang="scss">
:root {
  --separator: #d3dbe9;
  --separator-text: #83a3be;
}
</style>