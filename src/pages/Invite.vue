<template>
  <div class="vc-app w-full h-full box-border flex flex-col m-0 vc-theme_light">
    <VcLoading v-if="loading" active></VcLoading>

    <VcLoginForm
      logo="/assets/logo-white.svg"
      background="/assets/background.jpg"
      :title="$t('SHELL.INVITATION.TITLE')"
    >
      <VcForm>
        <VcInput
          class="mb-4 mt-1"
          :label="$t('SHELL.INVITATION.FIELDS.EMAIL.LABEL')"
          :modelValue="userName"
          :disabled="true"
        ></VcInput>
        <VcInput
          ref="passwordField"
          class="mb-4 mt-1"
          :label="$t('SHELL.INVITATION.FIELDS.PASSWORD.LABEL')"
          :placeholder="$t('SHELL.INVITATION.FIELDS.PASSWORD.PLACEHOLDER')"
          type="password"
          :required="true"
          :disabled="!form.tokenIsValid"
          v-model="form.password"
          @update:modelValue="validate"
        ></VcInput>
        <VcInput
          ref="confirmPasswordField"
          class="mb-4"
          :label="$t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')
          "
          :required="true"
          :disabled="!form.tokenIsValid"
          v-model="form.confirmPassword"
          type="password"
          @update:modelValue="validate"
          @keyup.enter="acceptInvitation"
        ></VcInput>
        <div class="flex justify-center items-center pt-2">
          <span v-if="$isDesktop.value" class="grow basis-0"></span>
          <vc-button
            variant="primary"
            :disabled="loading || !form.isValid || !form.tokenIsValid"
            @click="acceptInvitation"
          >
            {{ $t("SHELL.INVITATION.ACCEPT_INVITATION") }}
          </vc-button>
        </div>

        <VcHint
          class="mt-3"
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
import { useUser, useForm } from "@vc-shell/framework";
import { useRouter } from "vue-router";
import { useIsFormValid } from "vee-validate";

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
