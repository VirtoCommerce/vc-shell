import { Breadcrumbs } from "./../../../ui/types/index";
import { ComputedRef, computed, reactive } from "vue";
import * as _ from "lodash-es";

interface HistoryRecord {
  records: Breadcrumbs[];
  current?: Breadcrumbs;
}

export interface IUseBreadcrumbs {
  breadcrumbs: ComputedRef<Breadcrumbs[]>;
  push: (breadcrumb: Breadcrumbs) => void;
  remove: (ids: string[]) => void;
}

export function useBreadcrumbs() {
  const history = reactive<HistoryRecord>({
    current: undefined,
    records: [],
  });

  function isBreadcrumbsEqual(x: Breadcrumbs | undefined, y: Breadcrumbs | undefined) {
    return x && y && x.id === y.id && x.title === y.title;
  }

  function removeNext(id: string) {
    const index = history.records.findIndex((record) => record.id === id);
    if (index !== -1) {
      history.current = history.records[index];

      history.records.splice(index);
    }
  }

  function push(breadcrumb: Breadcrumbs) {
    const bread = {
      ...breadcrumb,
      clickHandler: (id: string) => {
        if (breadcrumb.clickHandler) {
          breadcrumb.clickHandler?.(id);

          // remove next items in history.records
          removeNext(id);
        }
      },
    };

    if (
      history.current &&
      !isBreadcrumbsEqual(history.current, bread) &&
      !isBreadcrumbsEqual(history.current, _.last(history.records))
    ) {
      history.records.push(history.current);
    }

    if (bread) {
      history.current = bread;
    }
  }

  function remove(ids: string[]) {
    // remove items with ids from history.records
    history.records = history.records.filter((record) => !ids.includes(record.id));

    if (history.current && ids.includes(history.current.id)) {
      history.current = undefined;
    }
  }

  return {
    breadcrumbs: computed(() => history.records.concat([history.current!])),
    push,
    remove,
  };
}
