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
    async callApi(flowItem: FlowItem | ApiItem | ConditionItem){
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
    stopFlow () {
      const uiStore = useUiStore();
      if (this.controller) {
        this.controller.abort();
        uiStore.setIsExecutedFlow(this.latestExecutedFlowItemId, 'Done')
        this.isExecuting = false;
      }
    }
  }
});
