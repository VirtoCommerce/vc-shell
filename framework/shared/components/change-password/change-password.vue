<template>
  <VcPopup
    :title="t('COMPONENTS.CHANGE_PASSWORD.TITLE')"
    is-mobile-fullscreen
    @close="cancelChange"
  >
    <template #content>
      <!-- <div class="change-password tw-p-3 tw-overflow-scroll"> -->
      <VcForm class="tw-flex tw-flex-col tw-flex-auto">
        <div
          v-if="forced"
          class="tw-mb-4"
        >
          <vc-status
            extend
            :outline="false"
            variant="info-dark"
          >
            <div class="tw-flex tw-flex-row tw-items-center tw-text-[color:var(--change-password-text-color)]">
              <VcIcon
                icon="far fa-lightbulb"
                size="l"
                class="tw-mr-3"
              />
              <div>
                <p>{{ t("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL") }}</p>
              </div>
            </div>
          </vc-status>
        </div>

        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          name="current"
          rules="required|min:6"
          :model-value="form.currentPassword"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.currentPassword"
            class="tw-mb-4 tw-mt-1 tw-shrink-0"
            :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          name="new_pass"
          rules="required|min:6"
          :model-value="form.password"
        >
          <VcInput
            v-bind="field"
            ref="newPasswordField"
            v-model="form.password"
            class="tw-mb-4 tw-mt-1 tw-shrink-0"
            :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          name="confirm_pass"
          rules="required|min:6"
          :model-value="form.confirmPassword"
        >
          <VcInput
            v-bind="field"
            ref="confirmPasswordField"
            v-model="form.confirmPassword"
            class="tw-mb-4 tw-shrink-0"
            :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
      </VcForm>
    </template>
    <template #footer>
      <div class="tw-flex tw-flex-col tw-flex-auto">
        <div class="tw-flex tw-justify-between tw-flex-auto">
          <!-- <span
          v-if="$isDesktop.value"
          class="tw-grow tw-basis-0"
        ></span> -->
          <VcButton
            :outline="true"
            class="tw-mr-3"
            @click="cancelChange"
          >
            {{ t("COMPONENTS.CHANGE_PASSWORD.CANCEL") }}
          </VcButton>
          <VcButton
            :disabled="loading || !form.isValid || isDisabled"
            @click="changePassword"
          >
            {{ t("COMPONENTS.CHANGE_PASSWORD.SAVE") }}
          </VcButton>
        </div>
        <VcHint
          v-for="(err, i) in form.errors"
          :key="i"
          class="tw-mt-3 !tw-text-[color:var(--change-password-error-color)]"
        >
          <!-- TODO: stylizing-->
          {{
            (err as IIdentityError).code ? t(`COMPONENTS.CHANGE_PASSWORD.ERRORS.${(err as IIdentityError).code}`) : err
          }}
        </VcHint>
      </div>
    </template>

    <!-- </div> -->
  </VcPopup>
</template>

<script lang="ts" setup>
import { nextTick, reactive, computed } from "vue";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { VcInput, VcHint, VcButton, VcPopup, VcForm } from "./../../../ui/components";
import { IIdentityError } from "./../../../core/api/platform";
import { useUser } from "./../../../core/composables/useUser";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

interface IChangePassForm {
  isValid: boolean;
  errors: IIdentityError[] | string[];
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export interface Props {
  forced?: boolean;
  login?: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "close"): void;
}

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const { changeUserPassword, loading, validatePassword } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const router = useRouter();
const { signOut } = useUser();

const form = reactive<IChangePassForm>({
  isValid: false,
  errors: [],
  currentPassword: "",
  password: "",
  confirmPassword: "",
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

async function cancelChange() {
  if (props.forced) {
    await signOut();
    await router.push("/login");
  } else {
    emit("close");
  }
}

async function changePassword() {
  const result = await changeUserPassword(form.currentPassword, form.password);
  if (result?.succeeded) {
    if (props.forced) {
      await router.push("/");
    } else {
      emit("close");
    }
  } else if (result?.errors) {
    form.errors = result?.errors;
    form.isValid = form.errors.length == 0;
  }
}

function validate() {
  nextTick(async () => {
    if (form.password || form.confirmPassword) {
      form.errors = (await validatePassword(form.password)).errors ?? [];
      if (form.confirmPassword !== form.password) {
        (form.errors as IIdentityError[]).push({ code: "Repeat-password" });
      }
      if (form.confirmPassword === form.currentPassword && form.password === form.currentPassword) {
        (form.errors as IIdentityError[]).push({ code: "Equal-passwords" });
      }
      form.isValid = form.errors.length == 0;
    }
  });
}
</script>

<style lang="scss">
:root {
  --change-password-error-color: var(--danger-500);
  --change-password-text-color: var(--additional-950);
}
</style>
