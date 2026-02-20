import { computed, ref, type Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { AppDescriptor } from "@core/api/platform";
import type { AppBarWidget } from "@core/services";

export type ApplicationsViewMode = "list" | "tiles";
type ApplicationsViewPreference = ApplicationsViewMode | "auto";

const APP_HUB_VIEW_MODE_STORAGE_KEY = "vc_app_hub_applications_view_mode";
const AUTO_TILES_THRESHOLD = 12;

export interface UseAppHubOptions {
  appsList: Ref<AppDescriptor[]>;
  widgets: Ref<AppBarWidget[]>;
  showApplications: Ref<boolean>;
  mobile: Ref<boolean>;
  hasCustomApplicationsSlot: Ref<boolean>;
}

export function useAppHub(options: UseAppHubOptions) {
  const searchQuery = ref<string | null>("");
  const applicationsViewPreference = useLocalStorage<ApplicationsViewPreference>(APP_HUB_VIEW_MODE_STORAGE_KEY, "auto");

  const normalizedQuery = computed(() => (searchQuery.value ?? "").trim().toLowerCase());
  const hasQuery = computed(() => normalizedQuery.value.length > 0);

  const autoApplicationsViewMode = computed<ApplicationsViewMode>(() => {
    return options.appsList.value.length > AUTO_TILES_THRESHOLD ? "tiles" : "list";
  });

  const applicationsViewMode = computed<ApplicationsViewMode>(() => {
    if (options.mobile.value) {
      return "list";
    }

    if (applicationsViewPreference.value === "list" || applicationsViewPreference.value === "tiles") {
      return applicationsViewPreference.value;
    }

    return autoApplicationsViewMode.value;
  });

  const isApplicationsTilesView = computed(() => applicationsViewMode.value === "tiles");

  const showApplicationsViewToggle = computed(() => {
    return (
      options.showApplications.value &&
      !options.mobile.value &&
      !options.hasCustomApplicationsSlot.value &&
      options.appsList.value.length > 0
    );
  });

  const filteredApps = computed(() => {
    if (!options.showApplications.value) {
      return [];
    }

    if (!hasQuery.value) {
      return options.appsList.value;
    }

    return options.appsList.value.filter((app) => {
      const haystack = [app.title, app.description, app.id, app.relativeUrl].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(normalizedQuery.value);
    });
  });

  const filteredWidgets = computed(() => {
    if (!hasQuery.value) {
      return options.widgets.value;
    }

    return options.widgets.value.filter((widget) => {
      const haystack = [getWidgetTitle(widget), widget.id, ...(widget.searchTerms ?? [])].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery.value);
    });
  });

  function setApplicationsViewMode(mode: ApplicationsViewMode): void {
    applicationsViewPreference.value = mode;
  }

  function getWidgetTitle(widget: AppBarWidget): string {
    return widget.title || humanizeWidgetId(widget.id);
  }

  return {
    searchQuery,
    filteredApps,
    filteredWidgets,
    applicationsViewMode,
    isApplicationsTilesView,
    showApplicationsViewToggle,
    setApplicationsViewMode,
    getWidgetTitle,
  };
}

function humanizeWidgetId(id: string): string {
  if (!id) {
    return "";
  }

  return id
    .replace(/[\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
