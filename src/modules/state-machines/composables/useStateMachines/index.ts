import { useApiClient } from "@vc-shell/framework";
import { computed, Ref, ref } from "vue";

import {
  VcmpSmClient,
  SmInstance,
  ISearchSmInstancesQuery,
  SearchSmInstancesQuery,
} from "../../../../api_client/marketplacevendor";

interface IUseStateMachines {
  readonly stateMachine: Ref<SmInstance>;
  searchStateMachines(query?: ISearchSmInstancesQuery): void;
  fireTrigger(
    smInstanceId: string,
    trigger: string,
    orderId: string
  ): Promise<SmInstance>;
}

export default (): IUseStateMachines => {
  const stateMachine = ref(new SmInstance());
  const { getApiClient } = useApiClient(VcmpSmClient);

  async function searchStateMachines(query: ISearchSmInstancesQuery) {
    const client = await getApiClient();
    stateMachine.value = await (
      await client.searchInstance({
        take: 20,
        ...(query || {}),
      } as SearchSmInstancesQuery)
    ).results.find(() => true);
  }

  async function fireTrigger(
    smInstanceId: string,
    trigger: string,
    orderId: string
  ) {
    const client = await getApiClient();
    const result = await client.fire(smInstanceId, trigger, orderId);
    return result;
  }

  return {
    stateMachine: computed(() => stateMachine.value),
    searchStateMachines,
    fireTrigger,
  };
};
