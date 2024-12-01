import { defineStore } from 'pinia';
import type { EndItem } from '~/types/item/end';
import { type FlowItem } from '~/types/item/flow';

export const useEndtStore = defineStore('endStore', {
  state: () => ({
  }),
  actions: {
    addEndItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "end",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: []
      } as EndItem
    )
    {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem)
    },
  }
});