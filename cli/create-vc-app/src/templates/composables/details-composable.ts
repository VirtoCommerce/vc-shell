import { computed, ref, ComputedRef, Ref, reactive } from "vue";
import { useAsync, useApiClient, useModificationTracker, useLoading } from "@vc-shell/framework";

// TODO: Replace with your actual API client imports
// Example: import { ProductsClient, IProduct } from "@your-app/api/products";

// @ts-expect-error - Replace with your API types
interface I{{EntityName}} {
  id?: string;
  name?: string;
  createdDate?: string;
  [key: string]: any;
}

// @ts-expect-error - Replace with your API client
class {{EntityName}}Client {
  // TODO: Replace these mock methods with your actual API client methods
  async get{{EntityName}}ById(id: string): Promise<I{{EntityName}}> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
  
  async update{{EntityName}}(data: I{{EntityName}}): Promise<I{{EntityName}}> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
  
  async create{{EntityName}}(data: I{{EntityName}}): Promise<I{{EntityName}}> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
  
  async delete{{EntityName}}(id: string): Promise<void> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
}

export interface IUse{{EntityName}}Details {
  item: Ref<I{{EntityName}}>;
  loading: ComputedRef<boolean>;
  load{{EntityName}}: (id: string) => Promise<void>;
  save{{EntityName}}: (data?: I{{EntityName}}) => Promise<I{{EntityName}} | undefined>;
  delete{{EntityName}}: (id: string) => Promise<void>;

  // Modification tracking
  isModified: Readonly<Ref<boolean>>;
  resetModificationState: () => void;
}

export function use{{EntityName}}Details(): IUse{{EntityName}}Details {
  const { getApiClient } = useApiClient({{EntityName}}Client);

  const item = ref<I{{EntityName}}>(reactive({} as I{{EntityName}}));

  // Use modification tracker - КАК В useOrderDetailsNew.ts
  const { currentValue, isModified, resetModificationState } = useModificationTracker(item);

  const { action: load{{EntityName}}, loading: loading{{EntityName}} } = useAsync<string>(async (id) => {
    if (id) {
      const apiClient = await getApiClient();
      const data = await apiClient.get{{EntityName}}ById(id);

      currentValue.value = reactive(data);
      resetModificationState();
    }
  });

  const { action: save{{EntityName}}, loading: saving{{EntityName}} } = useAsync<I{{EntityName}} | undefined, I{{EntityName}} | undefined>(
    async (data) => {
      if (!data) return;

      const apiClient = await getApiClient();
      let result: I{{EntityName}};

      if (data.id) {
        result = await apiClient.update{{EntityName}}(data);
      } else {
        result = await apiClient.create{{EntityName}}(data);
      }

      if (result) {
        currentValue.value = reactive(result);
        resetModificationState();
      }

      return result;
    }
  );

  // IMPORTANT: useAsync<string> means id is typed as string | undefined - always guard!
  const { action: delete{{EntityName}}, loading: deleting{{EntityName}} } = useAsync<string>(async (id) => {
    if (!id) return;  // Guard required - id can be undefined
    const apiClient = await getApiClient();
    await apiClient.delete{{EntityName}}(id);
  });

  return {
    item: currentValue, // ВАЖНО: возвращаем currentValue, а не item
    loading: useLoading(loading{{EntityName}}, saving{{EntityName}}, deleting{{EntityName}}),
    load{{EntityName}},
    save{{EntityName}},
    delete{{EntityName}},
    isModified,
    resetModificationState,
  };
}
