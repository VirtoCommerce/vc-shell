import { i18n } from "@vc-shell/framework";
import { ref, computed } from "vue";

const roles = ref([
  {
    id: "vcmp-admin-role",
    name: computed(() => i18n.global.t("TEAM.ROLES.ADMIN")),
  },
  {
    id: "vcmp-agent-role",
    name: computed(() => i18n.global.t("TEAM.ROLES.AGENT")),
  },
  {
    id: "vcmp-owner-role",
    name: computed(() => i18n.global.t("TEAM.ROLES.OWNER")),
  },
]);

export { roles };
