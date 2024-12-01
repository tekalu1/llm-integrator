import { defineStore } from 'pinia';
import { type ExecutionResult, type FlowItem } from '~/types/item/flow';

export const useUiStore = defineStore('uiStore', {
  state: () => ({
    editMode: {},
    itemDisplayMode: {},
    methodColor: {
      "GET": "#21ad7a",
      "POST": "#f75c2f",
      "DELETE": "#2f50f7",
      "PUT": "#f72ff0",
    },
    focusedItemId: "",
  }),
  actions: {
    getEditModeStatus(flowId: string): string{
      if(!this.editMode[flowId]){
        this.editMode[flowId] = 'form'
      }
      return this.editMode[flowId]
    },
    setEditModeStatus(flowId: string, editModeStatus: string): void{
      this.editMode[flowId] = editModeStatus
    },
    getItemDisplayMode(flowItem: FlowItem): string{
      if(!this.itemDisplayMode[flowItem.id]){
        this.setItemDisplayMode(flowItem, 'default')
      }
      return this.itemDisplayMode[flowItem.id]
    },
    setItemDisplayMode(flowItem: FlowItem, itemDisplayMode: string): void{
      this.itemDisplayMode[flowItem.id] = itemDisplayMode
      if(flowItem.flowItems.length > 0){
        flowItem.flowItems.forEach((flowItemChild) => {
          this.setItemDisplayMode(flowItemChild, itemDisplayMode)
        })
      }
    },
    setFocusedItemId(flowId: string): void{
      this.focusedItemId = flowId
    }
  }
});