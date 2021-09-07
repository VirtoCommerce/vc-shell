<template>
  <vc-layout-login :logo="logo" :background="background" :title="title">
    <vc-form>
      <vc-form-field class="vc-margin-bottom_l" label="Login">
        <vc-form-input v-model="form.username"></vc-form-input>
      </vc-form-field>
      <vc-form-field class="vc-margin-bottom_l" label="Password">
        <vc-form-input
          v-model="form.password"
          type="password"
          @keyup.enter="login"
        ></vc-form-input>
      </vc-form-field>
      <div
        class="
          vc-margin-bottom_l
          vc-flex
          vc-flex-justify_space-between
          vc-flex-align_center
        "
      >
        <vc-checkbox>Remember me</vc-checkbox>
        <vc-link>Forgot your password?</vc-link>
      </div>
      <div class="vc-flex vc-flex-justify_space-between vc-flex-align_center">
        <vc-link>Sign in with Azure Active Directory</vc-link>
        <vc-button variant="primary" :disabled="loading" @click="login">
          Log in
        </vc-button>
      </div>
      <div v-if="!signInResult.succeeded" style="color: red">
        <!-- TODO: stylizing-->
        {{ signInResult.error }}
      </div>
    </vc-form>
  </vc-layout-login>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useLogger, useUser, SignInResult } from "@virtoshell/core";

export default defineComponent({
  props: {
    logo: {
      type: String,
      default: undefined,
    },

    background: {
      type: String,
      default: undefined,
    },

    title: {
      type: String,
      default: undefined,
    },
  },

  setup() {
    const log = useLogger();
    const signInResult = ref<SignInResult>({ succeeded: true });
    const { signIn, loading } = useUser();
    const form = {
      username: "",
      password: "",
    };

    const login = async () => {
      signInResult.value = await signIn(form.username, form.password);
    };

    log.debug("Init login-page");

    return {
      form,
      login,
      loading,
      signInResult,
    };
  },
});
</script>
