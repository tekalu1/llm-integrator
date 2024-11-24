import { defineStore } from 'pinia';

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
    getItemDisplayMode(flowId: string): string{
      if(!this.itemDisplayMode[flowId]){
        this.itemDisplayMode[flowId] = 'request'
      }
      return this.itemDisplayMode[flowId]
    },
    setItemDisplayMode(flowId: string, itemDisplayMode: string): void{
      this.itemDisplayMode[flowId] = itemDisplayMode
    },
    setFocusedItemId(flowId: string): void{
      this.focusedItemId = flowId
    }
  }
});