import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type FlowItem, type SavedFlowItem } from '~/types/item/flow';
import { type Condition } from '~/types/item/condition';
import { type LoopItem } from '~/types/item/loop';

export const useLoopStore = defineStore('loopStore', {
  state: () => ({
  }),
  actions: {
    addLoopItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "loop",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
        loopType: 'while',
        condition: {
          id: uuidv4(),
          leftSide: {
            value: '',
            valueType: 'string'
          },
          comparisonOperator: '=',
          rightSide: {
            value: '',
            valueType: 'string'
          }
        } as Condition
      } as LoopItem
    )
    {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem)
    },
  }
});