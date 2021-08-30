<template>
  <vc-layout-login :branding="branding">
    <vc-form>
      <vc-form-field class="vc-margin-bottom_l" label="Login">
        <vc-form-input v-model="form.username"></vc-form-input>
      </vc-form-field>
      <vc-form-field class="vc-margin-bottom_l" label="Password">
        <vc-form-input v-model="form.password" type="password"></vc-form-input>
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
        <vc-button variant="primary" :disabled="loading" @click="login"
          >Log in</vc-button
        >
      </div>
      <div v-if="!signInResult.succeeded" style="color: red">
        <!-- TODO: stylizing-->
        {{ signInResult.error }}
      </div>
    </vc-form>
  </vc-layout-login>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useRouter, useLogger, useUser, SignInResult } from "@virtoshell/core";

export default defineComponent({
  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    const log = useLogger();
    const router = useRouter();
    const signInResult: Ref<SignInResult> = ref({ succeeded: true });
    const { signIn, loading } = useUser();
    const form = {
      username: "",
      password: "",
    };

    const login = async () => {
      signInResult.value = await signIn(form.username, form.password);
      if (signInResult.value.succeeded) {
        router.replace({ name: "orders" });
      }
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
