import { defineStore } from 'pinia';
import { type FlowItem } from '~/types/item/flow';
import { type ScriptItem } from '~/types/item/script';

export const useScriptStore = defineStore('scriptStore', {
  state: () => ({
  }),
  actions: {
    addScriptItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "script",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
        script: ''
      } as ScriptItem
    )
    {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem)
    },
  }
});