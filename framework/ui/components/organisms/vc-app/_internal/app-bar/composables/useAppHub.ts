import { computed, ref, type Ref } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import type { AppBarWidget } from "@core/services";
import { usePermissions } from "@core/composables";

export interface UseAppHubOptions {
  appsList: Ref<AppDescriptor[]>;
  widgets: Ref<AppBarWidget[]>;
  showApplications: Ref<boolean>;
  mobile: Ref<boolean>;
}

export function useAppHub(options: UseAppHubOptions) {
  const { hasAccess } = usePermissions();
  const searchQuery = ref<string | null>("");

  const normalizedQuery = computed(() => (searchQuery.value ?? "").trim().toLowerCase());
  const hasQuery = computed(() => normalizedQuery.value.length > 0);

  const accessibleApps = computed(() => options.appsList.value.filter((app) => hasAccess(app.permission)));

  const filteredApps = computed(() => {
    if (!options.showApplications.value) {
      return [];
    }

    if (!hasQuery.value) {
      return accessibleApps.value;
    }

    return accessibleApps.value.filter((app) => {
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

  function getWidgetTitle(widget: AppBarWidget): string {
    return widget.title || humanizeWidgetId(widget.id);
  }

  return {
    searchQuery,
    filteredApps,
    filteredWidgets,
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
