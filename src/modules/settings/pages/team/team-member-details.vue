<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="30%"
    :closable="closable"
    :expanded="expanded"
    :toolbar-items="bladeToolbar"
    :expandable="false"
    @close="$emit('close:blade')"
  >
    <template
      v-if="$slots['error']"
      #error
    >
      <slot name="error"></slot>
    </template>
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
              :model-value="userDetails.firstName"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.firstName"
                class="tw-p-3"
                :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
                :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER')"
                :disabled="isOwnerReadonly"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
              :model-value="userDetails.lastName"
              name="lastName"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.lastName"
                class="tw-p-3"
                :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
                :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER')"
                :disabled="isOwnerReadonly"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
              :model-value="userDetails.email"
              name="email"
              rules="required|email"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.email"
                class="tw-p-3"
                :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
                :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')"
                :disabled="!!props.param"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>

        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
              :model-value="userDetails.role"
              name="role"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="userDetails.role"
                class="tw-p-3"
                :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
                :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER')"
                :options="roles"
                option-value="id"
                option-label="name"
                :disabled="isOwnerReadonly"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                :clearable="false"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>
        <VcRow v-if="userDetails.id">
          <VcCol>
            <VcSwitch
              v-model="isActive"
              class="tw-p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL')"
              :true-value="false"
              :false-value="true"
              :disabled="isOwnerReadonly"
            />
          </VcCol>
        </VcRow>
        <VcRow v-else>
          <VcCol>
            <VcSwitch
              v-model="sendInviteStatus"
              class="tw-p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.INVITE.LABEL')"
            ></VcSwitch>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, unref } from "vue";
import {
  useUser,
  IParentCallArgs,
  IBladeToolbar,
  usePopup,
  useBeforeUnload,
  useBladeNavigation,
} from "@vc-shell/framework";
import useTeamMembers from "../../composables/useTeamMembers";
import { useIsFormValid, Field, useForm, useIsFormDirty } from "vee-validate";
import { ISellerUser } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
    user: ISellerUser;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "TeamMemberDetails",
});

useForm({ validateOnMount: false });
const { user } = useUser();

const { t } = useI18n({ useScope: "global" });
const {
  userDetails,
  loading,
  modified,
  handleUserDetailsItem,
  createTeamMember,
  resetEntries,
  deleteTeamMember,
  updateTeamMember,
  sendTeamMemberInvitation,
} = useTeamMembers();

const { showError, showConfirmation } = usePopup();

const { onBeforeClose } = useBladeNavigation();

const title = computed(() =>
  props.param ? userDetails.value.firstName + " " + userDetails.value.lastName : t("SETTINGS.TEAM.PAGES.DETAILS.TITLE"),
);

const sendInviteStatus = ref(false);
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();

useBeforeUnload(computed(() => !isDisabled.value && modified.value));

const isOwnerReadonly = computed(() => userDetails.value.role === "vcmp-owner-role");

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "invite",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      if (isValid.value) {
        try {
          await createTeamMember(userDetails.value, sendInviteStatus.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (e: unknown) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            showEmailExistsError();
          } else {
            throw e;
          }
        }
      } else {
        showError(unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID"))));
      }
    },
    isVisible: !props.param,
    disabled: computed(() => !(!isDisabled.value && modified.value)),
  },
  {
    id: "save",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        try {
          await updateTeamMember(userDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (e) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            showEmailExistsError();
          }
        }
      } else {
        showError(unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID"))));
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => !!props.param && !(!isDisabled.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => !!props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      if (await showConfirmation(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")))) {
        removeUser();
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => isOwnerReadonly.value || user.value?.userName === props.options?.user?.userName),
  },
  {
    id: "resend",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESEND")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      if (props.options && props.options.user && props.options.user.sellerId) {
        try {
          await sendTeamMemberInvitation({ id: props.options.user.id! });
          emit("close:blade");
        } catch (e) {
          console.error(e);
          throw e;
        }
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => isOwnerReadonly.value) || !!userDetails.value.email,
  },
]);

const roles = [
  {
    id: "vcmp-admin-role",
    name: "Admin",
  },
  {
    id: "vcmp-agent-role",
    name: "Agent",
  },
];

const role = computed(
  () => roles.find((x) => x.id === userDetails.value.role) || roles.find((x) => x.id === "vcmp-agent-role"),
);

const isActive = computed({
  get: () => !userDetails.value.isLockedOut,
  set: (val) => {
    userDetails.value.isLockedOut = !val;
  },
});

onMounted(async () => {
  if (props.param && props.options?.user) {
    handleUserDetailsItem(props.options.user);

    if (props.options.user.role === "vcmp-owner-role") {
      roles.push({
        id: "vcmp-owner-role",
        name: "Owner",
      });
    }
  } else {
    userDetails.value.role = role.value?.id ?? "";
    handleUserDetailsItem(userDetails.value);
  }
});

onBeforeClose(async () => {
  if (modified.value) {
    return await showConfirmation(unref(computed(() => t("SETTINGS.TEAM.ALERTS.CLOSE_CONFIRMATION"))));
  }
});

function showEmailExistsError() {
  showError(
    t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.MESSAGE.USER_EXIST", {
      email: userDetails.value.email,
    }),
  );
}

async function removeUser() {
  if (props.param) {
    await deleteTeamMember({ id: props.param });
    emit("parent:call", {
      method: "reload",
    });
    emit("close:blade");
  }
}
</script>
