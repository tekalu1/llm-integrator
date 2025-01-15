import { defineStore } from 'pinia';
import { type ExecutionResult, type ExecutionResultV2, type FlowItem } from '~/types/item/flow';
import type { ExecuteStatus, IsExecutedFlow, SideMenuStatus, ViewMode } from '~/types/ui';

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
    executionResults: {
    } as ExecutionResultV2,
    isExecutedFlow: {} as IsExecutedFlow,
    sideMenuStatus: 'Flow List' as SideMenuStatus,
    viewMode: 'Laboratory' as ViewMode,
    isGenerating: {}
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
    },
    getExecutionResults(flowId: string): ExecutionResult[]{
      if(!this.executionResults[flowId]){
        this.executionResults[flowId] = []
      }
      return this.executionResults[flowId]
    },
    setExecutionResults(flowId: string, executionResult: ExecutionResult): void{
      this.executionResults[flowId].push(executionResult)
    },
    getIsExecutedFlow(flowId: string): ExecuteStatus {
      if(!this.isExecutedFlow[flowId]){
        this.isExecutedFlow[flowId] = 'Not yet'
      }
      return this.isExecutedFlow[flowId]
    },
    setIsExecutedFlow(flowId: string, status: ExecuteStatus): void{
      this.isExecutedFlow[flowId] = status
    },
    clearIsExecutedFlow() {
      this.isExecutedFlow = {} as IsExecutedFlow
    },
    getSideMenuStatus(): SideMenuStatus {
      return this.sideMenuStatus
    },
    setSideMenuStatus(status: SideMenuStatus) {
      this.sideMenuStatus = status
    },
    getViewMode(): ViewMode {
      return this.viewMode
    },
    setViewMode(mode: ViewMode) {
      this.viewMode = mode
    },
    getIsGenerating(flowId: string): boolean{
      if(!this.isGenerating[flowId]){
        this.isGenerating[flowId] = false
      }
      return this.isGenerating[flowId]
    },
    setIsGenerating(flowId: string, isGenerating: boolean): void{
      this.isGenerating[flowId] = isGenerating
    }
  }
});