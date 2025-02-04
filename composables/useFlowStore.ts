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
    changeFlowItemById(targetId: string, newFlowItem: FlowItem, setParentItem: boolean = false, parentItems: FlowItem[] = []) {
      let parentItemsTemp: FlowItem[]
      if(setParentItem){
        parentItemsTemp = parentItems
      }else{
        parentItemsTemp = this.masterFlow.flowItems
      }
      parentItemsTemp.forEach((flowItem, index) => 
        {
          if(flowItem.id == targetId){
            parentItemsTemp[index] = newFlowItem
            return
          }else{
            this.changeFlowItemById(targetId, newFlowItem, true, flowItem.flowItems)
          }
        }
      )
    },
    removeFlowItemById(targetId: string, setParentItem: boolean = false, parentItems: FlowItem[] = []) {
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
    async loadFlows() {
      const apiFlows = await $fetch(`/api/flow-store/get-flow-list`, {
        method: 'GET'
      })
      if (apiFlows.error) {
        console.error('Failed to load flows from API:', apiFlows.error)
        return
      }
      if (apiFlows && apiFlows.length > 0) {
        this.savedFlowItems = apiFlows
      } else {
        // API 経由のデータが無い場合、legacy の localStorage から読み込み・移行
        try {
          const lsData = JSON.parse(localStorage.getItem('saved-flow-items') || '[]')
          if (Array.isArray(lsData) && lsData.length > 0) {
            this.savedFlowItems = lsData
            // localStorage の各データを API 経由で保存（新規保存扱い）
            for (const flow of lsData) {
              await $fetch<SavedFlowItem>('/api/flow-store/save-flow', {
                method: 'POST',
                body: {
                  flowItem: flow.flowItem,
                  isSaveAs: true
                }
              })
            }
            localStorage.removeItem('saved-flow-items')
          }
        } catch (e) {
          console.error('Failed to load flows from localStorage:', e)
        }
      }
    },

    async saveFlow(flowItem: FlowItem, isSaveAs = false) {
      const payload = {
        flowItem,
        isSaveAs,
        // 更新の場合、現在ロード済みの id を送信
        id: isSaveAs ? undefined : this.uuuidOfLoadedSavedFlow || undefined
      }
      console.log(payload)
      try {
        const savedFlow = await $fetch<SavedFlowItem>('/api/flow-store/save-flow', {
          method: 'POST',
          body: payload
        })
        // ローカルの state を更新
        const index = this.savedFlowItems.findIndex(item => item.id === savedFlow.id)
        if (index !== -1) {
          this.savedFlowItems[index] = savedFlow
        } else {
          this.savedFlowItems.push(savedFlow)
        }
        this.uuuidOfLoadedSavedFlow = savedFlow.id
        // legacy localStorage のデータがあれば削除
        localStorage.removeItem('saved-flow-items')
      } catch (error) {
        console.error('Failed to save flow:', error)
      }
    },

    async deleteSavedFlow(deleteIndex: number) {
      const flowToDelete = this.savedFlowItems[deleteIndex]
      try {
        await $fetch(`/api/flow-store/flows/${flowToDelete.id}`, {
          method: 'DELETE'
        })
        this.savedFlowItems.splice(deleteIndex, 1)
        localStorage.removeItem('saved-flow-items')
      } catch (error) {
        console.error('Failed to delete flow:', error)
      }
    },

    async loadFlow(savedFlowItem: SavedFlowItem) {
      try {
        const flow = await $fetch<SavedFlowItem>(`/api/flow-store/flows/${savedFlowItem.id}`)
        this.importFlow(flow.flowItem)
        this.uuuidOfLoadedSavedFlow = savedFlowItem.id
      } catch (error) {
        console.error('Failed to load flow:', error)
      }
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
    isApiTokenRegistered(): boolean{
      if ("openAiApiKey" in this.masterFlow.variables) {
        return true
      }
      return false
    },
    async generateFlowItem(prompt: string){
      if(!this.isApiTokenRegistered()){
        throw new Error('The API token does not exist');
      }
      
      const { data, status, error, refresh, clear } = await useFetch('/api/gen-ai/execute', {
          method: 'POST',
          body: {
            "prompt": prompt, 
            "token": this.masterFlow.variables["openAiApiKey"]
          },
          credentials: 'include'
      })
      if(error.value) {
        throw new Error('API error: ' + error.value);
      }
      return data
    }
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