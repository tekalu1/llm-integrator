import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type ExecutionResult, type FlowItem } from '~/types/item/flow';
import { type ApiItem, type RequestParameter } from '~/types/item/api';
import { type ConditionItem, type Condition } from '~/types/item/condition';
import { type ScriptItem } from '~/types/item/script';
import { transformEntriesArray, reverseTransformToRequestParameterArray } from '~/utils/common/jsonConverter'
import { executeStep } from '~/utils/flow/execute';
import { executeScript, executeScriptApiItem } from '~/utils/flow/script';
import { processStream } from '~/utils/execute/processStream';

export const useAPIExecution = defineStore('APIExecution', {
  state: () => ({
    isExecuting: false,
    latestExecutedFlowItemId: ''
  }),
  actions: {
    async executeStep (apiItem: ApiItem) {
      return executeStep(apiItem)
    },
    executeScriptApiItem(apiItem: ApiItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      executeScriptApiItem(apiItem, flowStore.masterFlow.variables, uiStore.executionResults[apiItem.id].slice(-1)[0])
    },
    executeScript(scriptItem: ScriptItem) {
      const flowStore = useFlowStore();
      executeScript(scriptItem, flowStore.masterFlow.variables)
    },
    transformEntriesArray(requestParameters: any, parentType = 'object'): RequestParameter[]{
      return transformEntriesArray(requestParameters, parentType)
    },
    reverseTransformToRequestParameterArray(params: RequestParameter[], parentType = 'object'): any {
      return reverseTransformToRequestParameterArray(params, parentType)
    },
    async runFlow (flowItem: FlowItem) {
      const uiStore = useUiStore();

      this.isExecuting = true;
      const startTime = Date.now();
  
      try {
        uiStore.clearIsExecutedFlow()
        await this.callApi(flowItem)
        if (uiStore.executionResults[flowItem.id]) {
        } else {
        }
      } catch (e: any) {
        console.error(e)
      } finally {
        this.isExecuting = false; // 実行ステータスを解除
      }
    },
    controller: null as AbortController | null,
    async callApiByServer(flowItem: FlowItem | ApiItem | ConditionItem){
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      this.controller = new AbortController();
      try {
        const response = await fetch('/api/execute/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flowItem: flowItem,
            variables: flowStore.masterFlow.variables
          }),
          signal: this.controller.signal
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        // status.value = 'streaming';

        const reader = response.body.getReader();

        // 汎用処理関数を使用
        await processStream(reader, (jsonData) => {
          console.log('Received:', jsonData);
          if(jsonData.executionResult){
            uiStore.setExecutionResults(jsonData.id,jsonData.executionResult)
          }
          if(jsonData.variables){
            flowStore.masterFlow.variables = jsonData.variables
          }
          if(jsonData.status){
            uiStore.setIsExecutedFlow(jsonData.id, jsonData.status)
            this.latestExecutedFlowItemId = jsonData.id
          }
        });
        this.isExecuting = false
      } catch (error: any) {
        console.error('Streaming error:', error);
        this.isExecuting = false
      }
    },
    stopFlowByServer () {
      const uiStore = useUiStore();
      if (this.controller) {
        this.controller.abort();
        uiStore.setIsExecutedFlow(this.latestExecutedFlowItemId, 'Done')
        this.isExecuting = false;
      }
    },
    async callApi (flowItem: FlowItem | ApiItem | ConditionItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      const delay = (ms: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      const startTime = Date.now();
      if(!flowItem.isItemActive){
        return
      }
      if(!this.isExecuting){
        return
      }
      uiStore.setIsExecutedFlow(flowItem.id, 'In progress')
      try {
        if(flowItem.type === 'condition' || flowItem.type === 'loop'){
          if(!flowStore.evaluateCondition(flowItem.condition)){
            uiStore.setIsExecutedFlow(flowItem.id, 'Done')
            return
          }
        }
        if(flowItem.type === 'api'){
          let stepConverted: ApiItem = JSON.parse(JSON.stringify(flowItem))
          stepConverted.headers = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.headers),flowItem)
          stepConverted.endpoint = flowStore.applyFlowVariablesOnString(flowItem.endpoint,flowItem)
          stepConverted.body = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.body),flowItem)
          console.log(stepConverted)
          const result = await this.executeStep(stepConverted); // 個別ステップをサーバーに送信
          if (result && result.result) {
            const executionResult: ExecutionResult = {
              id: uuidv4(),
              success: result.result.success,
              data: result.result.data ? result.result.data : {},
              error: result.result.error ? result.result.error : null,
              executionDate: startTime,
              duration: Date.now() - startTime
            } 
            uiStore.setExecutionResults(flowItem.id,executionResult)
            this.executeScriptApiItem(flowItem)
          }
          console.log("result : ")
          console.log(result)
          console.log(result.result.success)
          if (!result.result.success) {
              useMessageQueue().addMessage('error',`ステップ ${flowItem.name? flowItem.name:'Untitled'} でエラーが発生しました: ${result.error}`)
              throw new Error(`ステップ ${flowItem.name? flowItem.name:'Untitled'} でエラーが発生しました: ${result.error}`);
          }
        }
        
        if(flowItem.type === 'script'){
          this.executeScript(flowItem)
        }
        if(flowItem.flowItems.length > 0){
          for (const item of flowItem.flowItems) {
            await this.callApi(item); // 子ステップを実行
          }
        }
        if(flowItem.type === 'loop'){
          console.log("flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition) : ",flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition))
          if(flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition)){
            await delay(200)
            await this.callApi(JSON.parse(JSON.stringify(flowItem)))
          }
        }
        if(flowItem.type === 'end'){
          this.isExecuting = false
        }
        
        if(flowItem.type === 'wait'){
          await delay(flowItem.waitTime)
        }
        uiStore.setIsExecutedFlow(flowItem.id, 'Done')
      } catch (e: any) {
          // error.value = `予期しないエラーが発生しました: ${e.message}`;
          console.log("error : " + e.message)
          uiStore.setIsExecutedFlow(flowItem.id, 'Done')
          throw e;
      }
    },
    stopFlow () {
      this.isExecuting = false;
    }
  }
});
