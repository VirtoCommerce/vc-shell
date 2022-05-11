<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="loading"
    @close="$emit('page:close')"
    :closable="closable"
    :expanded="expanded"
    :toolbarItems="bladeToolbar"
  >
    <VcContainer>
      <VcRow>
        <VcCol>
          <VcInput
            class="p-3"
            :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
            :placeholder="
              $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER')
            "
            :required="true"
            name="name"
            v-model="userDetails.firstName"
          >
          </VcInput>
        </VcCol>
      </VcRow>
      <VcRow>
        <VcCol>
          <VcInput
            class="p-3"
            :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
            :placeholder="
              $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER')
            "
            :required="true"
            name="lastName"
            v-model="userDetails.lastName"
          >
          </VcInput>
        </VcCol>
      </VcRow>
      <VcRow>
        <VcCol>
          <VcInput
            class="p-3"
            :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
            :placeholder="
              $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')
            "
            :required="true"
            name="email"
            rules="email"
            :disabled="!!props.param"
            v-model="userDetails.email"
          >
          </VcInput>
        </VcCol>
      </VcRow>
      <VcRow v-if="userDetails.id">
        <VcCol>
          <VcSwitch
            class="p-3"
            :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL')"
            v-model="isActive"
            :true-value="false"
            :false-value="true"
          />
        </VcCol>
      </VcRow>
      <VcRow v-else>
        <VcCol>
          <VcSelect
            class="p-3"
            :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
            :placeholder="
              $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER')
            "
            :isRequired="true"
            name="role"
            :options="roles"
            v-model="userDetails.role"
            :initialItem="role"
            keyProperty="id"
            displayProperty="name"
          >
          </VcSelect>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
  <ErrorPopup
    v-if="isEmailExistsModal"
    @close="isEmailExistsModal = false"
    :email="userDetails.email"
  ></ErrorPopup>
  <WarningPopup
    v-if="deleteModal"
    @close="deleteModal = false"
    @delete="removeUser"
  ></WarningPopup>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, unref } from "vue";
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";
import useTeamMembers from "../../composables/useTeamMembers";
import ErrorPopup from "../../components/ErrorPopup.vue";
import WarningPopup from "../../components/WarningPopup.vue";
import { useForm } from "@virtoshell/ui";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["page:close", "parent:call"]);
const { validate } = useForm({ validateOnMount: false });

const { t } = useI18n();
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

const title = computed(() =>
  userDetails.value.firstName && userDetails.value.lastName
    ? userDetails.value.firstName + " " + userDetails.value.lastName
    : t("SETTINGS.TEAM.PAGES.DETAILS.TITLE")
);

const isEmailExistsModal = ref(false);
const deleteModal = ref(false);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "invite",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.INVITE")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          await createTeamMember(userDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
        } catch (e) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            isEmailExistsModal.value = true;
          }
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID")))
        );
      }
    },
    isVisible: !props.param,
    disabled: computed(() => !modified.value),
  },
  {
    id: "save",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          await updateTeamMember(userDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
        } catch (e) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            isEmailExistsModal.value = true;
          }
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID")))
        );
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    clickHandler() {
      deleteModal.value = true;
    },
    isVisible: !!props.param,
  },
  {
    id: "resend",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESEND")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      if (props.options && props.options.user && props.options.user.sellerId) {
        await sendTeamMemberInvitation({ id: props.options.user.sellerId });
        emit("page:close");
      }
    },
    isVisible: !!props.param,
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
  {
    id: "vcmp-seller-role",
    name: "Seller",
  },
  {
    id: "vcmp-owner-role",
    name: "Owner",
  },
];

const role = computed(() => roles.find((x) => x.id === userDetails.value.role));

// TODO temporary solution
const isActive = computed({
  get: () => !userDetails.value.isLockedOut,
  set: (val) => {
    userDetails.value.isLockedOut = !val;
  },
});

onMounted(async () => {
  if (props.param && props.options.user) {
    handleUserDetailsItem(props.options.user);
  }
});

async function removeUser() {
  if (userDetails.value.id) {
    deleteModal.value = false;
    await deleteTeamMember({ id: userDetails.value.id });
    emit("parent:call", {
      method: "reload",
    });
    emit("page:close");
  }
}
</script>

<style lang="scss" scoped></style>
