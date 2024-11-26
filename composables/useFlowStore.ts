import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type FlowItem, type SavedFlowItem } from '@/types/flow';
import { type ApiItem } from '@/types/api';
import { type ConditionItem, type Condition } from '@/types/condition';

export const useFlowStore = defineStore('flowStore', {
  state: () => ({
    savedFlowItems: [] as SavedFlowItem[],
    uuuidOfLoadedSavedFlow: '' as string,
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
    history : []
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
          leftSide: '',
          comparisonOperator: '=',
          rightSide: ''
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
    applyFlowVariables(obj, flowItem: FlowItem) {
      // 変数のキーを ${variableName} の形式で取得し展開
      let result = JSON.parse(JSON.stringify(obj))
      let resultStr = JSON.stringify(result)

      resultStr = this.applyFlowVariablesOnString(resultStr, flowItem)
      console.log(resultStr)

      return JSON.parse(resultStr)
    },
    applyFlowVariablesOnString(text: string, flowItem: FlowItem): string {
      // 変数のキーを ${variableName} の形式で取得し展開
      let result = text
      for(let key in this.masterFlow.variables){
        result = result.replace("{{" + key + "}}",this.masterFlow.variables[key])
      }

      return result.replace(/\n/g, "\\n")
    },
    loadFlows(){
      try{
        this.savedFlowItems = JSON.parse(localStorage.getItem('saved-flow-items') || '[]');
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
      
      this.masterFlow = savedFlowItem.flowItem;
      this.uuuidOfLoadedSavedFlow = savedFlowItem.id
    },
    importFlow(flowItem: FlowItem) {
      this.masterFlow = flowItem
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
    changeConditionType(condition: Condition, type: 'condition'|'string'|'number'|'boolean', direction: 'left'|'right' ) {
      let value: string | Condition | number | boolean;

      if (type == 'condition') {
        value = { id:uuidv4(), leftSide: '', comparisonOperator: '=', rightSide: '' }
      }else if(type == 'string'){
        value = ''
      }else if(type == 'number'){
        value = 0
      }else{
        value = true
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
        condition.leftSide = ''
        condition.comparisonOperator = '='
        condition.rightSide = '' 
      }
    },
    evaluateCondition(condition: Condition): boolean {
      const evaluateValue = (value: string | Condition | number | boolean): any => {
          if (typeof value === 'object') {
              // If the value is a nested Condition, evaluate it recursively
              return this.evaluateCondition(value);
          }
          return value;
      };
  
      let left: boolean | string | number = ''
      if(typeof condition.leftSide === 'string'){
        left = this.applyFlowVariablesOnString(evaluateValue(condition.leftSide),this.masterFlow);
      }else{
        left = evaluateValue(condition.leftSide)
      }
      let right: boolean | string | number = ''
      if(typeof condition.rightSide === 'string'){
        right = this.applyFlowVariablesOnString(evaluateValue(condition.rightSide),this.masterFlow);
      }else{
        right = evaluateValue(condition.rightSide)
      }
      console.log("left : " + left)
      console.log("left type : " + typeof left)
      console.log("right : " + right)
  
      switch (condition.comparisonOperator) {
          case '=':
              return left === right;
          case '!=':
              return left !== right;
          case '<':
              return left < right;
          case '>':
              return left > right;
          case '<=':
              return left <= right;
          case '>=':
              return left >= right;
          case 'contain':
              if (typeof left === 'string' && typeof right === 'string') {
                  return left.includes(right);
              }
              throw new Error(`Invalid types for 'contain' operator: ${typeof left} and ${typeof right}`);
          case '&':
              return Boolean(left) && Boolean(right);
          case '|':
              return Boolean(left) || Boolean(right);
          default:
              throw new Error(`Unsupported operator: ${condition.comparisonOperator}`);
      }
    },
    setupWatcher() {
      watch(
        () => this.masterFlow,
        (newValue, oldValue) => {
          this.handleFlowChange(newValue, oldValue)
        },
        {
          deep: true,
          immediate: true
        }
      )
    },
    handleFlowChange(newValue: FlowItem, oldValue: FlowItem) {
      // console.log('masterFlowの変更を検知:', {
      //   new: newValue,
      //   old: oldValue
      // })
      // 変更時の処理を実装
      if(this.history.length === 0){
        this.history.push(this.masterFlow)
      }
      this.history.push(newValue)
    }
  }
});