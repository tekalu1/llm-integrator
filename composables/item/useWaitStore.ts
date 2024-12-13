import { defineStore } from 'pinia';
import { type FlowItem } from '~/types/item/flow';
import type { WaitItem } from '~/types/item/wait';

export const useWaitStore = defineStore('waitStore', {
  state: () => ({
  }),
  actions: {
    addEndItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "wait",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
        waitTime: 0
      } as WaitItem
    )
    {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem)
    },
  }
});