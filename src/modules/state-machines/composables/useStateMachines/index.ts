import { useApiClient } from "@vc-shell/framework";
import { computed, Ref, ref } from "vue";

import {
  VcmpSmClient,
  StateMachineInstance,
  ISearchStateMachineInstancesQuery,
  SearchStateMachineInstancesQuery,
} from "@vcmp-vendor-portal/api/marketplacevendor";

interface IUseStateMachines {
  readonly stateMachine: Ref<StateMachineInstance>;
  searchStateMachines(query?: ISearchStateMachineInstancesQuery): void;
  fireTrigger(smInstanceId: string, trigger: string, orderId: string): Promise<StateMachineInstance>;
}

export default (): IUseStateMachines => {
  const stateMachine = ref(new StateMachineInstance());
  const { getApiClient } = useApiClient(VcmpSmClient);

  async function searchStateMachines(query: ISearchStateMachineInstancesQuery) {
    const client = await getApiClient();
    const res = await await client.searchInstance({
      take: 20,
      ...(query || {}),
    } as SearchStateMachineInstancesQuery);

    if (res.results) {
      stateMachine.value = res.results.find(() => true)!;
    }
  }

  async function fireTrigger(smInstanceId: string, trigger: string, orderId: string) {
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
