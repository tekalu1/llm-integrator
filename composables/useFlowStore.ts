import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type FlowItem, type SavedFlowItem } from '~/types/item/flow';
import { type ApiItem } from '~/types/item/api';
import { type ConditionItem, type Condition, type ConditionValueType, type ConditionValue } from '~/types/item/condition';
import { applyFlowVariables, applyFlowVariablesOnString } from '~/utils/flow/variable'
import { evaluateCondition, evaluateConditionReturnByConditionValue } from '~/utils/flow/condition'

export const useFlowStore = defineStore('flowStore', {
  state: () => ({
    savedFlowItems: [] as SavedFlowItem[],
    uuuidOfLoadedSavedFlow: '' as string,
    historyIndex: -1 as number,
    masterFlow : {
      id: uuidv4(),
      name: "",
      type: "flow",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
    } as FlowItem,
    histories : [] as FlowItem[],
    isHistoryLoaded : false as boolean
  }),
  actions: {
    addFlowItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "flow",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
      } as FlowItem
    ) {
      let newFlowItemIdUpdated = JSON.parse(JSON.stringify(newflowItem));
      this.changeFlowId(newFlowItemIdUpdated);
      parentItems.push(newFlowItemIdUpdated);
    },
    changeFlowId(
      flowItem:FlowItem
    ) {
      flowItem.id = uuidv4()
      if(flowItem.flowItems.length > 0){
        flowItem.flowItems.forEach((flowItemChild) => {
          this.changeFlowId(flowItemChild)
        })
      }
    },
    duplicateFlowItem(parentItem: FlowItem, flowItem: FlowItem){
      this.addFlowItem(parentItem.flowItems, flowItem)
    },
    addApiItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "api",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
        endpoint: "",
        method: "GET",
        headers: [],
        body: [],
        script: "",
        isScriptEnabled: false
      } as ApiItem
    )
    {
      this.addFlowItem(parentItems, newflowItem)
    },
    addConditionItem(
      parentItems: FlowItem[],
      newflowItem = {
        id: "",
        name: "",
        type: "condition",
        description: "",
        isItemActive: true,
        variables: {},
        executionResults: [],
        flowItems: [],
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
      } as ConditionItem
    )
    {
      this.addFlowItem(parentItems, newflowItem)
    },
    removeFlowItemById(targetId: string, setParentItem: boolean, parentItems: FlowItem[]) {
      let parentItemsTemp =  this.masterFlow.flowItems
      if(setParentItem){
        parentItemsTemp = parentItems
      }
      parentItemsTemp.forEach((flowItem, index) => 
        {
          if(flowItem.id == targetId){
            parentItemsTemp.splice(index, 1)
            return
          }else{
            this.removeFlowItemById(targetId, true, flowItem.flowItems)
          }
        }
      )
    },
    applyFlowVariables(obj: any) {
      return applyFlowVariables(obj, this.masterFlow.variables)
    },
    applyFlowVariablesOnString(text: string): string {
      return applyFlowVariablesOnString(text, this.masterFlow.variables)
    },
    loadFlows(){
      try{
        this.savedFlowItems = JSON.parse(localStorage.getItem('saved-flow-items') || '[]');
      }catch(e){
        console.error('Failed to load saved flows:', e);
      }
    },
    clearLegacyData(){
      try{
        this.clearExecutionResultsFlowItem(this.masterFlow)
      }catch(e){
        console.error('Failed to clearLegacyData:', e);
      }
    },
    clearExecutionResultsFlowItem(flowItem: FlowItem){
      try{
        flowItem.executionResults = []
        if(flowItem.flowItems.length > 0){
          for(const flowItemChild of flowItem.flowItems){
            this.clearExecutionResultsFlowItem(flowItemChild)
          }
        }
      }catch(e){
        console.error('Failed to load saved flows:', e);
      }
    },
    saveFlow(flowItem: FlowItem, isSaveAs = false) {
      const savedflowItem: SavedFlowItem = {
        id: uuidv4(),
        flowItem: flowItem,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      if(isSaveAs || this.uuuidOfLoadedSavedFlow === ''){
        this.savedFlowItems.push(savedflowItem)
      }else{
        const existingIndex = this.savedFlowItems.findIndex((item: SavedFlowItem) => item.id === this.uuuidOfLoadedSavedFlow);
        this.savedFlowItems[existingIndex] = savedflowItem
      }
      localStorage.setItem('saved-flow-items', JSON.stringify(this.savedFlowItems));
      this.uuuidOfLoadedSavedFlow = savedflowItem.id;
    },
    deleteSavedFlow(deleteIndex: number) {
      this.savedFlowItems.splice(deleteIndex,1)
      localStorage.setItem('saved-flow-items', JSON.stringify(this.savedFlowItems));
    },
    loadFlow(savedFlowItem: SavedFlowItem) {
      try {
        const stored = localStorage.getItem('saved-flow-items');
        if (stored) {
          this.savedFlowItems = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load saved flows:', e);
      }
      
      this.importFlow(savedFlowItem.flowItem)
      this.uuuidOfLoadedSavedFlow = savedFlowItem.id
    },
    importFlow(flowItem: FlowItem) {
      try{
        this.masterFlow = JSON.parse(JSON.stringify(flowItem))
        this.clearLegacyData()
      }catch(e){
        console.error(e)
      }
    },
    exportFlow(flowItem: FlowItem){
      const blob = new Blob([JSON.stringify(flowItem, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flowItem.name || 'flow'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    addHeader(apiItem: ApiItem) {
      if (apiItem) {
        apiItem.headers.push({ key: '', type: 'string', value: '' });
      }
    },
    removeHeader(apiItem: ApiItem, index: number) {
      if (apiItem) {
        apiItem.headers.splice(index, 1);
      }
    },
    addBodyParam(apiItem: ApiItem) {
      if (apiItem) {
        apiItem.body.push({ key: '', type: 'string', value: '' });
      }
    },
    removeBodyParam(apiItem: ApiItem, index: number) {
      if (apiItem) {
        apiItem.body.splice(index, 1);
      }
    },
    changeConditionType(condition: Condition, type: ConditionValueType, direction: 'left'|'right' ) {
      let value: ConditionValue

      if (type == 'condition') {
        value = { 
          value: {
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
          } as Condition,
          valueType: 'condition'
        } as ConditionValue
      }else if(type == 'string'){
        value = {
          value: '',
          valueType: 'string'
        }
      }else if(type == 'number'){
        value = {
          value: '0',
          valueType: 'number'
        }
      }else{
        value = {
          value: 'true',
          valueType: 'boolean'
        }
      }

      if(direction == 'left'){
        condition.leftSide = value
      }else{
        condition.rightSide = value
      }
    },
    resetCondition(condition: Condition) {
      if (condition) {
        condition.id = uuidv4()
        condition.leftSide = {
          value: '',
          valueType: 'string'
        }
        condition.comparisonOperator = '='
        condition.rightSide = {
          value: '',
          valueType: 'string'
        }
      }
    },
    evaluateCondition(condition: Condition): boolean{
      return evaluateCondition(this.applyFlowVariables(condition))
    },
    evaluateConditionReturnByConditionValue(condition: Condition): ConditionValue {
      return evaluateConditionReturnByConditionValue(this.applyFlowVariables(condition))
    },
    // setupWatcher() {
    //   watch(
    //     () => this.masterFlow,
    //     (newValue, oldValue) => {
    //       this.handleFlowChange(newValue, oldValue)
    //     },
    //     {
    //       deep: true,
    //       immediate: true
    //     }
    //   )
    // },
    // loadHistory(flowItem: FlowItem){
    //   this.isHistoryLoaded = true
    //   this.importFlow(flowItem)
    // },
    // handleFlowChange(newValue: FlowItem, oldValue: FlowItem) {
    //   // console.log('masterFlowの変更を検知:', {
    //   //   new: newValue,
    //   //   old: oldValue
    //   // })
    //   // 変更時の処理を実装
    //   if(this.histories.length === 0){
    //     this.histories.push(JSON.parse(JSON.stringify(this.masterFlow)))
    //   }
    //   if(this.isHistoryLoaded){
    //     this.isHistoryLoaded = false
    //     return
    //   }
    //   // if(JSON.stringify(newValue) !== JSON.stringify(this.histories[this.histories.length - 1])){
    //     this.histories.push(JSON.parse(JSON.stringify(newValue)))
    //     this.historyIndex = -1
    //   // }
    // },
    // undoHistory() {
    //   if(this.historyIndex === -1){
    //     this.historyIndex = this.histories.length - 2
    //   }else{
    //     this.historyIndex -= 1
    //   }
    //   this.masterFlow = JSON.parse(JSON.stringify(this.histories[this.historyIndex]))
    // },
    // redoHistory() {
    //   if(this.historyIndex === -1){
    //     return
    //   }else if(this.historyIndex >= this.histories.length - 1){
    //     return
    //   }else{
    //     this.historyIndex += 1
    //     this.masterFlow = JSON.parse(JSON.stringify(this.histories[this.historyIndex]))
    //   }
    // }
  }
});